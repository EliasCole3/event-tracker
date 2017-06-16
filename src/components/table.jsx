import React from 'react'
import { arraymove } from '../toolbox/array-methods'
import { clone } from '../toolbox/clone'
const moment = require('moment')
import { Modal } from './bs-modal-wrapper'
import Form from 'react-jsonschema-form'
import { dataTypeOf } from './../toolbox/data-type-of'

class Table extends React.Component {

  constructor(props) {
    super(props)
    let state = {}

    // if columnOrder isn't included in the Table config
    if(!this.props.columnOrder) {
      let columnOrder = []
      columnOrder.push('id')
      for(let prop in this.props.data[0]) {
        if(prop !== 'id') {
          columnOrder.push(prop)
        }
      }
      columnOrder.sort()
      state.columnOrder = columnOrder
      this.state = state
    }
  }

  onMoveRowUpButtonClicked = e => {
    let data = clone(this.props.data)
    let id = +e.target.getAttribute('data-entry-id')
    let fromIndex = data.findIndex(x => {
      return x.id === id
    })
    data = arraymove(data, fromIndex, fromIndex - 1)

    // set the sortOrder to the array index
    data.forEach((x, i) => {
      x.sortOrder = i
    })

    this.props.updateTableSettingsOrData({ data: data })
  }

  onMoveRowDownButtonClicked = e => {
    let data = clone(this.props.data)
    let id = +e.target.getAttribute('data-entry-id')
    let fromIndex = data.findIndex(x => {
      return x.id === id
    })
    data = arraymove(data, fromIndex, fromIndex + 1)

    // set the sortOrder to the array index
    data.forEach((x, i) => {
      x.sortOrder = i
    })

    this.props.updateTableSettingsOrData({ data: data })
  }

  onDeleteRowButtonClicked = e => {
    let data = clone(this.props.data)
    let id = +e.target.getAttribute('data-entry-id')
    let index = data.findIndex(x => {
      return x.id === id
    })
    data.splice(index, 1)
    this.props.updateTableSettingsOrData({ data: data })
  }

  onUpdateRowButtonClicked = e => {
    let id = +e.target.getAttribute('data-entry-id')
    let entryToUpdate = this.props.data.filter(x => {
      return x.id === id
    })[0]
    let tableSettings = clone(this.props.tableSettings)
    tableSettings.modalOpen = true
    tableSettings.modalSetting = 'update'
    tableSettings.entryToUpdate = entryToUpdate
    this.props.updateTableSettingsOrData({ settings: tableSettings })
  }

  onSingleViewRowButtonClicked = e => {
    let id = +e.target.getAttribute('data-entry-id')
    this.props.showSingleView(id)
  }

  sortColumn = column => {
    let newSettings = clone(this.props.tableSettings)
    let data = clone(this.props.data)

    if(this.props.tableSettings.currentSortColumn === column && this.props.tableSettings.currentSortDirection === 'descending') {
      data.sort((x, y) => {
        // sort ascending
        if(x[column] > y[column]) return 1
        if(x[column] < y[column]) return -1
        return 0
      })
      newSettings.currentSortDirection = 'ascending'
    } else {
      data.sort((x, y) => {
        // sort descending
        if(x[column] > y[column]) return -1
        if(x[column] < y[column]) return 1
        return 0
      })
      newSettings.currentSortDirection = 'descending'
    }

    newSettings.currentSortColumn = column

    this.props.updateTableSettingsOrData({ settings: newSettings, data: data })
  }

  createNewFullObject = params => {
    let newEntry = {
      id: params.id,
      sortOrder: params.id,
      created: moment().format('x'),
      updated: moment().format('x')
    }

    for(let prop in params.formData) {
      // todo: make this optional?
      if(dataTypeOf(params.formData[prop]) === 'array') {
        let values = []
        params.formData[prop].forEach((x, i) => {
          values.push(this.createNewFullObject({ id: i + 1, formData: x }))
        })
        newEntry[prop] = values
      } else {
        newEntry[prop] = params.formData[prop]
      }
    }

    return newEntry
  }

  addEntry = (formData, callback = null) => {
    let data = clone(this.props.data)

    // todo: make this an overridable default. Or make it not terrible. Either way...
    let entryWithHighestId = data.sort((x, y) => {
      // sort descending
      if(x.id > y.id) return -1
      if(x.id < y.id) return 1
      return 0
    })[0]

    let newId
    // it'll be undefined if the array is empty
    if(entryWithHighestId) {
      newId = entryWithHighestId.id + 1
    } else {
      newId = 1
    }

    let newEntry = this.createNewFullObject({ id: newId, formData: formData })
    data.push(newEntry)
    this.props.updateTableSettingsOrData({ data: data, callback: callback })
  }

  updateEntry = (formData, callback = null) => {
    let data = clone(this.props.data)
    let oldEntry = clone(this.props.tableSettings.entryToUpdate)
    let index = data.findIndex(x => {
      return x.id === oldEntry.id
    })

    // todo: an actual diff. Maybe mod copyNonstandardFieldsRecursively to do it too
    data[index].updated = moment().format('x')
    data[index] = this.copyNonstandardFieldsRecursively(data[index], formData)
    this.props.updateTableSettingsOrData({ data: data, callback: callback })
  }

  copyNonstandardFieldsRecursively = (newObj, oldObj) => {
    let propertiesToNotCopy = [
      'id',
      'sortOrder',
      'created',
      'updated'
    ]

    for(let prop in oldObj) {
      if(dataTypeOf(oldObj[prop]) === 'array') {
        newObj[prop] = []
        oldObj[prop].forEach(x => {
          newObj[prop].push(this.copyNonstandardFieldsRecursively({}, x))
        })
      } else {
        if(!propertiesToNotCopy.includes(prop)) {
          newObj[prop] = oldObj[prop]
        }
      }
    }

    return newObj
  }

  getModalInfo = () => {
    let obj = {}
    obj.title = ''
    obj.body = ''
    obj.footer = ''

    if(this.props.tableSettings.modalSetting === 'create') {
      obj.title = <b>Creating New Entry</b>
      obj.body = <Form
        schema={this.props.modelSchema}
        uiSchema={this.props.uiSchema}
        onChange={() => { }}
        onSubmit={e => {
          this.addEntry(e.formData, this.clearModalDataAndClose)
          {/*this.clearModalDataAndClose()*/ }
        }}
        onError={errors => {
          console.log('errors')
          console.log(errors)
        }}
      />
    }

    if(this.props.tableSettings.modalSetting === 'update') {
      obj.title = `Updating events for entry ${this.props.tableSettings.entryToUpdate.id}`
      obj.body = obj.body = <Form
        schema={this.props.modelSchema}
        uiSchema={this.props.uiSchema}
        formData={this.copyNonstandardFieldsRecursively({}, this.props.tableSettings.entryToUpdate)}
        onChange={() => { }}
        onSubmit={e => {
          this.updateEntry(e.formData, this.clearModalDataAndClose)
        }}
        onError={errors => {
          console.log('errors')
          console.log(errors)
        }}
      />
    }

    return obj
  }

  clearModalDataAndClose = () => {
    let tableSettings = clone(this.props.tableSettings)
    tableSettings.modalOpen = false
    tableSettings.modalSetting = null
    tableSettings.entryToUpdate = null
    this.props.updateTableSettingsOrData({ settings: tableSettings })
  }

  buildTable() {
    let data = clone(this.props.data)

    // filter the table data down based on the search string
    if(this.props.tableSettings.searchString !== '') {
      console.log(`current search string: '${this.props.tableSettings.searchString}'`)

      let regex = new RegExp(this.props.tableSettings.searchString, 'i')

      data = data.filter(x => {
        for(let prop in x) {
          if(regex.test(x[prop])) return true
        }
        return false
      })
    }

    let columnHeaders = []

    // empty header cell for the row select
    if(this.props.enabledFeatures && this.props.enabledFeatures.includes('row selectors')) {
      columnHeaders.push(<th key='row-selector'></th>)
    }

    let columnOrder = this.props.columnOrder ? this.props.columnOrder : this.state.columnOrder
    columnOrder.forEach(x => {
      let className = this.props.tableSettings.currentSortColumn === x ? 'column-header-sorted' : 'column-header'
      columnHeaders.push(
        <th
          className={className}
          key={x}
          name={x}
          onClick={e => {
            if(this.props.enabledFeatures && this.props.enabledFeatures.includes('column sorting')) {
              this.sortColumn(e.target.getAttribute('name'))
            }
          }}
        >
          {this.props.columnHeaderMap[x]}
        </th>
      )
    })

    let thead = (
      <thead>
        <tr>
          {columnHeaders}
        </tr>
      </thead>
    )

    let rows = data.map(x => {
      return (
        <Row
          entry={x}
          key={x.id}
          onMoveRowUpButtonClicked={this.onMoveRowUpButtonClicked}
          onMoveRowDownButtonClicked={this.onMoveRowDownButtonClicked}
          onDeleteRowButtonClicked={this.onDeleteRowButtonClicked}
          onUpdateRowButtonClicked={this.onUpdateRowButtonClicked}
          onSingleViewRowButtonClicked={this.onSingleViewRowButtonClicked}
          tableSettings={this.props.tableSettings}
          rowSelectorClicked={this.props.rowSelectorClicked}
          customRowButtons={this.props.customRowButtons}
          enabledFeatures={this.props.enabledFeatures}
          updateTableSettingsOrData={this.props.updateTableSettingsOrData}
          columnOrder={this.props.columnOrder ? this.props.columnOrder : this.state.columnOrder}
          propertiesWithCustomDatetimeFormatters={this.props.propertiesWithCustomDatetimeFormatters}
        />
      )
    })

    let tbody = <tbody>{rows}</tbody>

    let table = <table id='table' className='table'>{thead}{tbody}</table>

    let modalInfo = this.getModalInfo()

    let fullTable = (
      <div id='table-wrapper'>

        <ControlBar
          data={this.props.data}
          tableSettings={this.props.tableSettings}
          updateTableSettingsOrData={this.props.updateTableSettingsOrData}
          enabledFeatures={this.props.enabledFeatures}
        />

        {table}

        <Modal
          show={this.props.tableSettings.modalOpen}
          close={() => {
            let tableSettings = clone(this.props.tableSettings)
            tableSettings.modalOpen = false
            tableSettings.modalSetting = null
            this.props.updateTableSettingsOrData({ settings: tableSettings })
          }}
          title={modalInfo.title}
          body={modalInfo.body}
          footer={modalInfo.footer}
        />

      </div>
    )

    return fullTable
  }

  render() {
    return this.buildTable()
  }
}




class ControlBar extends React.Component {
  build = () => {
    let elements = []

    if(this.props.enabledFeatures && this.props.enabledFeatures.includes('create')) {
      elements.push(<button
        key='create'
        className='btn btn-md glyphicon glyphicon-plus create-button'
        onClick={() => {
          let tableSettings = clone(this.props.tableSettings)
          tableSettings.modalOpen = true
          tableSettings.modalSetting = 'create'
          this.props.updateTableSettingsOrData({ settings: tableSettings })
        }}
      />)
    }

    if(this.props.enabledFeatures && this.props.enabledFeatures.includes('search')) {
      elements.push(<SearchBox
        key='searchbox'
        data={this.props.data}
        tableSettings={this.props.tableSettings}
        updateTableSettingsOrData={this.props.updateTableSettingsOrData}
      />)
    }

    return elements
  }

  render() {
    return (
      <div id='table-control-bar'>
        {this.build()}
      </div>
    )
  }
}

class SearchBox extends React.Component {
  search = searchString => {
    let tableSettings = clone(this.props.tableSettings)
    tableSettings.searchString = searchString
    this.props.updateTableSettingsOrData({ settings: tableSettings })
  }

  render() {
    return (
      <input
        type='text'
        className='my-form-control'
        onChange={e => { this.search(e.target.value) }}
      />
    )
  }
}







class Row extends React.Component {
  render() {
    let cells = []

    if(this.props.enabledFeatures && this.props.enabledFeatures.includes('row selectors')) {
      let checked = this.props.tableSettings.selectedEntryIds.includes(this.props.entry.id) ? true : false
      cells.push(
        <Cell key='row-selector'>
          <input
            type='checkbox'
            className='row-selector-checkbox'
            data-entry-id={this.props.entry.id}
            onChange={e => {
              this.props.rowSelectorClicked(+e.target.getAttribute('data-entry-id'))
            }}
            checked={checked}
          />
        </Cell>
      )
    }

    this.props.columnOrder.forEach(x => {
      let value
      let customFormatString = this.props.propertiesWithCustomDatetimeFormatters[x]

      if(x === 'created' || x === 'updated') {
        // let value = moment(this.props.entry[prop], 'x').format('MM.DD.YY h:mm:ss a')
        // let value = moment(this.props.entry[prop], 'x').format('MM.DD.YY')
        value = moment(this.props.entry[x], 'x').format('MM/DD/YY HH:mm:ss')
      } else if(customFormatString) {
        value = moment(this.props.entry[x], 'x').format(customFormatString)
      } else {
        value = this.props.entry[x]
      }
      
      cells.push(<Cell value={value} key={x} />)
    })



    let buttons = []

    if(this.props.enabledFeatures && this.props.enabledFeatures.includes('delete')) {
      buttons.push(<td key='delete'><RowButton classes='button-delete-row glyphicon glyphicon-trash' entryId={this.props.entry.id} clicked={this.props.onDeleteRowButtonClicked} /></td>)
    }

    if(this.props.enabledFeatures && this.props.enabledFeatures.includes('update')) {
      buttons.push(<td key='update'><RowButton classes='button-update-row glyphicon glyphicon-edit' entryId={this.props.entry.id} clicked={this.props.onUpdateRowButtonClicked} /></td>)
    }

    if(this.props.enabledFeatures && this.props.enabledFeatures.includes('view')) {
      buttons.push(<td key='single-view'><RowButton classes='button-single-view-row glyphicon glyphicon-eye-open' entryId={this.props.entry.id} clicked={this.props.onSingleViewRowButtonClicked} /></td>)
    }

    if(this.props.enabledFeatures && this.props.enabledFeatures.includes('row transiency')) {
      buttons.push(<td key='up'> <RowButton classes='button-move-row-up glyphicon glyphicon-arrow-up' entryId={this.props.entry.id} clicked={this.props.onMoveRowUpButtonClicked} /></td>)
      buttons.push(<td key='down'><RowButton classes='button-move-row-down glyphicon glyphicon-arrow-down' entryId={this.props.entry.id} clicked={this.props.onMoveRowDownButtonClicked} /></td>)
    }

    if(this.props.customRowButtons && this.props.customRowButtons.length !== 0) {
      this.props.customRowButtons.forEach(x => {
        let classes = `button-${x.key}-row glyphicon glyphicon-${x.glyphicon}`
        buttons.push(
          <td key={x.key}>
            <RowButton
              classes={classes}
              entryId={this.props.entry.id}
              clicked={e => {
                let id = +e.target.getAttribute('data-entry-id')
                x.handler(id)
              }}
            />
          </td>
        )
      })
    }

    return (
      <tr
        data-entry-id={this.props.entry.id} // hook for gui tests
        data-entry-company={this.props.entry.company} // hook for gui tests
      >
        {cells}{buttons}
      </tr>
    )
  }
}






class Cell extends React.Component {
  render() {
    return <td>{this.props.value}{this.props.children}</td>
  }
}



class RowButton extends React.Component {
  render() {
    let classes = `btn btn-small ${this.props.classes}`

    return (
      <button
        className={classes}
        onClick={this.props.clicked}
        data-entry-id={this.props.entryId}
      ></button>
    )
  }
}



export { Table }