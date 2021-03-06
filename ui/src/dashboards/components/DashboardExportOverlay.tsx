import React, {PureComponent} from 'react'
import {withRouter, WithRouterProps} from 'react-router'

// Components
import ExportOverlay from 'src/shared/components/ExportOverlay'

// Utils
import {dashboardToTemplate} from 'src/shared/utils/resourceToTemplate'

// APIs
import {getDashboard} from 'src/dashboards/apis/v2'

interface State {
  dashboardTemplate: Record<string, any>
}

interface Props extends WithRouterProps {
  params: {dashboardID: string; orgID: string}
}

class DashboardExportOverlay extends PureComponent<Props, State> {
  public state: State = {dashboardTemplate: null}

  public async componentDidMount() {
    const {
      params: {dashboardID},
    } = this.props
    console.log('loading!?')
    const dashboard = await getDashboard(dashboardID)
    const dashboardTemplate = dashboardToTemplate(dashboard)

    this.setState({dashboardTemplate})
  }

  public render() {
    const {dashboardTemplate} = this.state
    if (!dashboardTemplate) {
      return null
    }
    return (
      <ExportOverlay
        resourceName="Dashboard"
        resource={dashboardTemplate}
        onDismissOverlay={this.onDismiss}
      />
    )
  }

  private onDismiss = () => {
    const {router} = this.props

    router.goBack()
  }
}

export default withRouter(DashboardExportOverlay)
