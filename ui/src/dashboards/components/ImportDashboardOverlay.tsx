// Libraries
import React, {PureComponent} from 'react'
import _ from 'lodash'
import {connect} from 'react-redux'

// Constants
import {dashboardImportFailed} from 'src/shared/copy/notifications'

// Actions
import {notify as notifyAction} from 'src/shared/actions/notifications'

// Types
import ImportOverlay from 'src/shared/components/ImportOverlay'
import {createDashboardFromTemplate as createDashboardFromTemplateAction} from 'src/dashboards/actions/v2'

interface OwnProps {
  onDismissOverlay: () => void
  orgID: string
  isVisible: boolean
}
interface DispatchProps {
  notify: typeof notifyAction
  createDashboardFromTemplate: typeof createDashboardFromTemplateAction
}

type Props = OwnProps & DispatchProps

class ImportDashboardOverlay extends PureComponent<Props> {
  constructor(props: Props) {
    super(props)
  }

  public render() {
    const {isVisible, onDismissOverlay} = this.props

    return (
      <ImportOverlay
        isVisible={isVisible}
        onDismissOverlay={onDismissOverlay}
        resourceName="Dashboard"
        onSubmit={this.handleUploadDashboard}
      />
    )
  }

  private handleUploadDashboard = (uploadContent: string): void => {
    const {
      notify,
      createDashboardFromTemplate,
      onDismissOverlay,
      orgID,
    } = this.props

    try {
      const template = JSON.parse(uploadContent)

      if (_.isEmpty(template)) {
        onDismissOverlay()
        return
      }

      createDashboardFromTemplate(template, orgID)
      onDismissOverlay()
    } catch (error) {
      notify(dashboardImportFailed(error))
    }
  }
}
const mdtp: DispatchProps = {
  notify: notifyAction,
  createDashboardFromTemplate: createDashboardFromTemplateAction,
}

export default connect<{}, DispatchProps, OwnProps>(
  null,
  mdtp
)(ImportDashboardOverlay)
