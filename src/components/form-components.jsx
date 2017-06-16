import React from 'react'
import { PropTypes } from 'prop-types'


class Input extends React.Component {
  buildComponent() {
    let input = (
      <span>
        <label className='my-label'>{this.props.label}</label> <br />
        <input id={this.props.id} type='text' name={this.props.name} className='my-form-control' value={this.props.value} onChange={this.props.handleChange} />
      </span>
    )

    return input
  }

  render() {
    return this.buildComponent()
  }
}

Input.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  handleChange: PropTypes.func.isRequired
}



class Textarea extends React.Component {
  buildComponent() {
    let input = (
      <span>
        <label className='my-label'>{ this.props.label }</label> <br />
        <textarea id={this.props.id} type='text' name={this.props.name} className='my-form-control' value={this.props.value} onChange={this.props.handleChange} />
      </span>
    )

    return input
  }

  render() {
    return this.buildComponent()
  }
}

Textarea.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.node.isRequired,
  handleChange: PropTypes.func.isRequired
}


export { Input, Textarea }