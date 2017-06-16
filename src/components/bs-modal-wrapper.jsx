import React from 'react'
import * as bs from 'react-bootstrap'

// https://react-bootstrap.github.io/components.html#modals
// https://www.npmjs.com/package/react-bootstrap-modal

class Modal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  // close = e => {
  //   console.log('called')
  //   this.setState({ showModal: false })
  // }

  render() {
    return (
      <bs.Modal show={this.props.show} onHide={this.props.close}>
        <bs.Modal.Header closeButton>
          <bs.Modal.Title>{this.props.title}</bs.Modal.Title>
        </bs.Modal.Header>
        <bs.Modal.Body>
          {this.props.body}
        </bs.Modal.Body>
        <bs.Modal.Footer>
          {this.props.footer}
        </bs.Modal.Footer>
      </bs.Modal>
    )
  }
}

export { Modal }



