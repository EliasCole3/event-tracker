import React from 'react'
import { Input, Textarea } from './form-components'
import { clone } from '../toolbox/clone'
import { PropTypes } from 'prop-types'
const moment = require('moment')

class CreateEntryForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      formControls: {
        company: '',
        description: '',
        jobTitle: '',
        notes: ''
      }
    }
  }

  handleFormControlChange = event => {
    let newState = clone(this.state)
    newState.formControls[event.target.getAttribute('name')] = event.target.value
    this.setState(newState)
  }

  submitForm = e => {
    console.log(`submitting new entry`)
    let dataToSubmit = clone(this.state.formControls)

    // create new entry payload from form control data
    let newId = this.props.getNewId()
    let newEntry = {
      id: newId,
      company: dataToSubmit.company,
      description: dataToSubmit.description,
      jobTitle: dataToSubmit.jobTitle,
      notes: dataToSubmit.notes,
      sortOrder: newId,
      created: moment().format('x'),
      updated: moment().format('x')
    }

    this.props.addNewEntryToData(newEntry)

    // clear the form fields
    let newState = clone(this.state)
    for(let prop in newState.formControls) {
      newState.formControls[prop] = ''
    }
    this.setState(newState)
  }

  buildForm() {
    let form = (<span>
      <Input id='new-form-company' label='Company' name='company' value={this.state.formControls.company} handleChange={this.handleFormControlChange} /> <br/>
      <Textarea id='new-form-description' label='Description' name='description' value={this.state.formControls.description} handleChange={this.handleFormControlChange} /> <br/>
      <Input id='new-form-job-title' label='Job Title' name='jobTitle' value={this.state.formControls.jobTitle} handleChange={this.handleFormControlChange} /> <br/>
      <Textarea id='new-form-notes' label='Notes' name='notes' value={this.state.formControls.notes} handleChange={this.handleFormControlChange} /> <br/>

      <button id='submit-new-entry' className='btn btn-lg' onClick={this.submitForm}>Submit</button>
    </span>)

    return form
  }

  render() {
    return this.buildForm()
  }
}

CreateEntryForm.propTypes = {
  addNewEntryToData: PropTypes.func.isRequired,
  getNewId: PropTypes.func.isRequired
}





class UpdateEntryForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      formControls: {
        company: this.props.entryToUpdate.company,
        description: this.props.entryToUpdate.description,
        jobTitle: this.props.entryToUpdate.jobTitle,
        notes: this.props.entryToUpdate.notes
      }
    }
  }

  handleFormControlChange = event => {
    let newState = clone(this.state)
    newState.formControls[event.target.getAttribute('name')] = event.target.value
    this.setState(newState)
  }

  submitForm = e => {
    let dataToSubmit = clone(this.state.formControls)

    let entry = {
      id: this.props.entryToUpdate.id,
      company: dataToSubmit.company,
      description: dataToSubmit.description,
      jobTitle: dataToSubmit.jobTitle,
      notes: dataToSubmit.notes,
      created: this.props.entryToUpdate.created,
      updated: moment().format('x')
    }

    this.props.updateEntry(entry)

    // clear the form fields
    let newState = clone(this.state)
    for(let prop in newState.formControls) {
      newState.formControls[prop] = ''
    }
    this.setState(newState)
    
    this.props.afterUpdate()
  }


  buildForm() {
    let form = (<span>
      <Input id='update-form-company' label='Company' name='company' value={this.state.formControls.company} handleChange={this.handleFormControlChange} /> <br/>
      <Textarea id='update-form-description' label='Description' name='description' value={this.state.formControls.description} handleChange={this.handleFormControlChange} /> <br/>
      <Input id='update-form-job-title' label='Job Title' name='jobTitle' value={this.state.formControls.jobTitle} handleChange={this.handleFormControlChange} /> <br/>
      <Textarea id='update-form-notes' label='Notes' name='notes' value={this.state.formControls.notes} handleChange={this.handleFormControlChange} /> <br/>

      <button id='submit-updated-entry' className='btn btn-lg' onClick={this.submitForm}>Submit</button>
    </span>)

    return form
  }

  render() {
    return this.buildForm()
  }
}

UpdateEntryForm.propTypes = {
  entryToUpdate: PropTypes.object.isRequired,
  updateEntry: PropTypes.func.isRequired,
  afterUpdate: PropTypes.func.isRequired
}









export { CreateEntryForm, UpdateEntryForm }