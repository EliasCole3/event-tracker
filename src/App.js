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

// Data
import { data as testdata1 } from './sample-data/data1.js'

// CSS
import './styles/App.css'
import './styles/react-simpletabs.css'



class App extends Component {
  constructor(props) {
    super(props)

    if(JSON.parse(localStorage.getItem('event-tracker-last-id')) === null) {
      localStorage.setItem('event-tracker-last-id', '0')
    }

    let localStorageState = JSON.parse(localStorage.getItem('event-tracker-data'))
    let state
    if(localStorageState === null || localStorageState.data.length === 0) {
      console.log(`failed to retrieve data from local storage, loading data from test file`)
      state = testdata1
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

  getEntriesTable = () => {
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
          rowSelectorClicked={this.rowSelectorClicked}
          modelSchema={{
            title: 'Entry',
            type: 'object',
            required: ['name', 'inGameTime'],
            properties: {
              name: { type: 'string', title: 'Name' },
              type: { type: 'string', title: 'Type' },
              inGameTime: { type: 'string', title: 'In Game Time' },
              notes: { type: 'string', title: 'Notes' }
            }
          }}
          uiSchema={{
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
                  <DateTimeField onChange={value => { props.onChange(value) }} />
                )
              }
            },
            notes: {
              'ui:widget': 'textarea',
              'ui:options': {
                rows: 7
              }
            }
          }}
          columnOrder={[
            'id',
            'name',
            'type',
            'inGameTime',
            'notes',
            'created',
            'updated'
          ]}

        />
      )
    } else {
      return (
        <h2>There is no data currently. Please click the '+' button to create an entry :)</h2>
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
            {this.getStateBox()}
            {this.getSaveButton()}
            {this.getLoadButton()}
          </Tabs.Panel>

          {/*<Tabs.Panel title='New'>
            <CreateEntryForm
              addNewEntryToData={this.addNewEntryToData}
              getNewId={this.getNewId}
            />
          </Tabs.Panel>*/}

          <Tabs.Panel title='Single'>
            <div id='single-view-wrapper'>
              <pre>
                {JSON.stringify(this.state.singleViewEntry, null, 2)}
              </pre>
            </div>
          </Tabs.Panel>

        </Tabs>

      </div>
    )
  }
}



export default App


