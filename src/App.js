// External Libraries
import React, { Component } from 'react'
import Tabs from './scripts/react-simpletabs'
import Form from 'react-jsonschema-form'
import DateTimeField from 'react-bootstrap-datetimepicker'
const moment = require('moment')

// Internal Dependencies
import { Table } from './components/table.jsx'
import { CreateEntryForm, UpdateEntryForm } from './components/crud-forms'
import { Modal } from './components/bs-modal-wrapper'
import { clone } from './toolbox/clone'
import { savefile } from './toolbox/savefile'
import { loadfile } from './toolbox/loadfile'
import { dataTypeOf } from './toolbox/data-type-of'

// Data
import { data as testdata1 } from './sample-data/data1.js'

// CSS
import './styles/App.css'
import './styles/react-simpletabs.css'
import './styles/bootstrap-datetimepicker.min.css'



class App extends Component {
  constructor(props) {
    super(props)

    if(JSON.parse(localStorage.getItem('event-tracker-last-id')) === null) {
      localStorage.setItem('event-tracker-last-id', '0')
    }

    let localStorageState = JSON.parse(localStorage.getItem('event-tracker-data'))
    let state
    if(localStorageState === null || localStorageState.data.length === 0) {
      console.log(`failed to retrieve data from local storage, loading static data`)
      state = testdata1
      // state = {}
      localStorage.setItem('event-tracker-last-id', '3')
      localStorage.setItem('event-tracker-data', JSON.stringify(state))
    } else {
      state = localStorageState
    }

    this.state = state
  }

  reloadStateFromLocalStorage = () => {
    let localStorageState = JSON.parse(localStorage.getItem('event-tracker-data'))
    if(localStorageState !== null && localStorageState.data.length !== 0) {
      this.setState(localStorageState)
      console.log(`reset state to local storage data`)
    } else {
      console.log(`local storage data invalid`)
    }
  }

  updateLocalStorage = () => {
    console.log(`updating local storage with: ${this.state}`)
    localStorage.setItem('event-tracker-data', JSON.stringify(this.state))
  }

  updateGlobalState = (newState, callback = null) => {
    this.setState(newState, () => {
      this.updateLocalStorage()
      if(callback) callback()
    })
  }

  addNewEntryToData = newEntry => {
    let newState = clone(this.state)
    newState.data.push(newEntry)
    this.setState(newState, this.updateLocalStorage)
  }

  updateEntry = entry => {
    let newState = clone(this.state)
    let index = newState.data.findIndex(x => {
      return x.id === entry.id
    })
    for(let prop in entry) {
      newState.data[index][prop] = entry[prop]
    }
    this.setState(newState, this.updateLocalStorage)
  }

  showUpdateForm = id => {
    let entryToUpdate = this.state.data.filter(x => {
      return x.id === id
    })[0]
    this.setState({
      modalOpen: true,
      entryToUpdate: entryToUpdate
    }, this.updateLocalStorage)
  }

  showSingleView = id => {
    let entryToShow = this.state.data.filter(x => {
      return x.id === id
    })[0]
    this.setState({
      activeTab: 2,
      singleViewEntry: entryToShow
    }, this.updateLocalStorage)
  }

  getSingleView = () => {
    if(this.state.singleViewEntry) {
      return JSON.stringify(this.state.singleViewEntry, null, 2)
    } else {
      return 'Click one of the row\'s eye buttons :)'
    }
  }

  showEventsView = id => {
    let entry = this.state.data.filter(x => {
      return x.id === id
    })[0]
    if(!entry.events) entry.events = []
    this.setState({
      activeTab: 4,
      entryWithEventsToUpdate: entry
    }, this.updateLocalStorage)
  }

  showModal = () => {
    this.setState({ modalOpen: true }, this.updateLocalStorage)
  }

  closeModal = () => {
    this.setState({
      modalOpen: false,
      entryToUpdate: null,
      entryWithEventsToUpdate: null
    }, this.updateLocalStorage)
  }

  rowSelectorClicked = entryId => {
    // let newState = clone(this.state)

    // if(newState.table.selectedEntryIds.includes(entryId)) {
    //   newState.table.selectedEntryIds = newState.table.selectedEntryIds.filter(x => { return x !== entryId })
    // } else {
    //   newState.table.selectedEntryIds.push(entryId)
    // }

    // this.setState(newState, this.updateLocalStorage)

    console.log(`rowSelectorClicked called`)
  }

  getNewId = () => {
    let newId = JSON.parse(localStorage.getItem('event-tracker-last-id'))
    newId++
    localStorage.setItem('event-tracker-last-id', JSON.stringify(newId))
    return newId
  }

  getModalInfo = () => {
    let obj = {}
    obj.title = ''
    obj.body = ''
    obj.footer = ''

    if(this.state.entryToUpdate) {
      obj.title = `Updating Entry ${this.state.entryToUpdate.id}`
      obj.body = (<UpdateEntryForm
        entryToUpdate={this.state.entryToUpdate}
        updateEntry={this.updateEntry}
        afterUpdate={() => {
          this.closeModal()
        }}
      />)
    }
    if(this.state.entryWithEventsToUpdate) {
      obj.title = `Updating events for entry ${this.state.entryWithEventsToUpdate.id}`
      obj.body = JSON.stringify(this.state.entryWithEventsToUpdate.events, null, 2)
    }

    return obj
  }

  afterTabChange = index => {
    this.setState({ activeTab: index }, this.updateLocalStorage)
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

  getEntriesTable = () => {
    let modelSchema = {
      type: 'object',
      required: ['name', 'inGameTime'],
      properties: {
        name: { type: 'string', title: 'Name' },
        type: { type: 'string', title: 'Type' },
        inGameTime: { type: 'string', title: 'In Game Time' },
        notes: { type: 'string', title: 'Notes' }
      }
    }

    let uiSchema = {
      'ui:rootFieldId': 'entry',
      'ui:order': [
        'name',
        'type',
        'inGameTime',
        'notes'
      ],
      name: {
        'ui:autofocus': true
      },
      inGameTime: {
        'ui:widget': (props) => {
          return (
            <DateTimeField 
              onChange={value => { props.onChange(value) }}
              defaultText={''}
            />
          )
        }
      },
      notes: {
        'ui:widget': 'textarea',
        'ui:options': {
          rows: 7
        }
      }
    }


    if(this.state.data.length !== 0) {
      return (
        <Table
          enabledFeatures={[
            'create',
            'view',
            'update',
            'delete',
            'search',
            'column sorting',
            'row transiency'
          ]}
          data={this.state.data}
          tableSettings={this.state.tableSettings.entries}
          updateTableSettingsOrData={params => {
            let state = clone(this.state)

            if(params.data) {
              state.data = params.data
            }

            if(params.settings) {
              state.tableSettings.entries = params.settings
            }

            this.setState(state, () => {
              this.updateLocalStorage()
              if(params.callback) params.callback()
            })
          }}
          showSingleView={this.showSingleView}
          modelSchema={modelSchema}
          uiSchema={uiSchema}
          columnOrder={[
            'id',
            'name',
            'type',
            'inGameTime',
            'notes',
            'created',
            'updated'
          ]}
          columnHeaderMap={{
            id: 'ID',
            name: 'Name',
            type: 'Type',
            inGameTime: 'In-Game Time',
            notes: 'Notes',
            created: 'Created',
            updated: 'Updated'
          }}
          propertiesWithCustomDatetimeFormatters={{
            inGameTime: 'MM/DD/YY HH:mm:ss'
          }}

        />
      )
    } else {
      return (
        <div id='new-entry-form-wrapper'>
          <Form
            schema={modelSchema}
            uiSchema={uiSchema}
            onChange={() => { }}
            onSubmit={e => {
              let state = clone(this.state)
              let newEntry = this.createNewFullObject({ id: 1, formData: e.formData })
              state.data.push(newEntry)
              this.setState(state, () => {
                this.updateLocalStorage()
              })
            }}
            onError={errors => {
              console.log('errors')
              console.log(errors)
            }}
          />
        </div>
      )
    }
  }

  getSaveButton = () => {
    return (
      <button
        id='savefile'
        className='btn btn-lg'
        onClick={e => {
          let filename = `event-tracker-state_${moment().format('MM_DD_YY_hh_mm_ss')}.json`
          savefile(JSON.stringify(this.state, '', 2), filename)
        }}
      >Save</button>
    )
  }

  getLoadButton = () => {
    return (
      <button
        id='loadfile'
        className='btn btn-lg'
        onClick={e => {
          loadfile(data => {
            let newState = JSON.parse(data)
            newState.activeTab = 1
            this.setState(newState, this.updateLocalStorage)
          })
        }}
      >Load</button>
    )
  }

  getStateBox = () => {
    return (
      <div id='state-box-wrapper'>
        <textarea id='state-box' value={JSON.stringify(this.state, '', 2)} onChange={e => { }}></textarea>
      </div>
    )
  }


  render() {
    return (
      <div className='App'>

        <Tabs
          tabActive={this.state.activeTab}
          onAfterChange={this.afterTabChange}
        >

          <Tabs.Panel title='Table'>
            {this.getEntriesTable()}
            {/*{this.getStateBox()}*/}
          </Tabs.Panel>

          <Tabs.Panel title='Single'>
            <div id='single-view-wrapper'>
              <pre>
                {this.getSingleView()}
              </pre>
            </div>
          </Tabs.Panel>

          <Tabs.Panel title='State Controls'>
            <br />
            {this.getSaveButton()}
            <br />
            <br />
            {this.getLoadButton()}
          </Tabs.Panel>

        </Tabs>

      </div>
    )
  }
}



export default App


