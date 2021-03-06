// Libs
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {compose} from 'recompose';
import {connect} from 'react-redux';
const openDialog = require('../renderers/dialog.js');
const ipc = require('electron').ipcRenderer;

// Actions
import * as Actions from '../actions/invoices';

// Selectors
import { getInvoices } from '../reducers/InvoicesReducer';

// Components
import Invoice from '../components/invoices/Invoice';
import Message from '../components/shared/Message';
import {Table, THead, TBody, TH, TR} from '../components/shared/Table';
import _withFadeInAnimation from '../components/shared/hoc/_withFadeInAnimation';
import {
  PageWrapper,
  PageHeader,
  PageHeaderTitle,
  PageContent,
} from '../components/shared/Layout';

class Invoices extends Component {
  constructor(props) {
    super(props);
    this.deleteInvoice = this.deleteInvoice.bind(this);
  }

  // Load Invoices & add event listeners
  componentDidMount() {
    // Add Event Listener
    ipc.on('confirmed-delete-invoice', (event, index, invoiceId) => {
      if (index === 0) {
        this.confirmedDeleteInvoice(invoiceId);
      }
    });
  }

  // Optimization
  shouldComponentUpdate(nextProps, nextState) {
    return this.props !== nextProps;
  }

  // Remove all IPC listeners when unmounted
  componentWillUnmount() {
    ipc.removeAllListeners('confirmed-delete-invoice');
  }

  // Open Confirm Dialog
  deleteInvoice(invoiceId) {
    openDialog(
      {
        type: 'warning',
        title: 'Delete This Invoice',
        message: 'Are You Sure?',
        buttons: ['Yes', 'No'],
      },
      'confirmed-delete-invoice',
      invoiceId
    );
  }

  // Confirm Delete an invoice
  confirmedDeleteInvoice(invoiceId) {
    const {dispatch} = this.props;
    dispatch(Actions.deleteInvoice(invoiceId));
  }

  // Render
  render() {
    const {invoices} = this.props;
    const invoicesComponent = invoices.map((invoice, index) =>
      <Invoice
        key={invoice._id}
        deleteInvoice={this.deleteInvoice}
        index={index}
        invoice={invoice}
      />
    );
    return (
      <PageWrapper>
        <PageHeader>
          <PageHeaderTitle>All Invoices</PageHeaderTitle>
        </PageHeader>
        <PageContent>
          {invoices.length === 0
            ? <Message info text="You don't have any invoice yet" />
            : <Table hasBorders bg>
                <THead>
                  <TR>
                    <TH>ID</TH>
                    <TH>Client</TH>
                    <TH>DueDate</TH>
                    <TH>Created</TH>
                    <TH>Value</TH>
                    <TH actions>Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {invoicesComponent}
                </TBody>
              </Table>}
        </PageContent>
      </PageWrapper>
    );
  }
}

// PropTypes Validation
Invoices.propTypes = {
  dispatch: PropTypes.func.isRequired,
  invoices: PropTypes.arrayOf(PropTypes.object).isRequired,
};

// Map state to props & Export
const mapStateToProps = state => ({
  invoices: getInvoices(state),
});

export default compose(
  connect(mapStateToProps),
  _withFadeInAnimation
)(Invoices);
