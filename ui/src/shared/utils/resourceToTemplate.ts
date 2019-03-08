import _ from 'lodash'
import {getDeep} from 'src/utils/wrappers'
import {Task, Label, Dashboard, Cell, View} from 'src/types/v2'
import {ITemplate, TemplateType} from '@influxdata/influx'

const CURRENT_TEMPLATE_VERSION = '1'

const blankTemplate = () => ({
  meta: {version: CURRENT_TEMPLATE_VERSION},
  content: {data: {}, included: []},
  labels: [],
})

const blankTaskTemplate = () => {
  const baseTemplate = blankTemplate()
  return {
    ...baseTemplate,
    meta: {
      ...baseTemplate.meta,
    },
    content: {
      ...baseTemplate.content,
      data: {...baseTemplate.content.data, type: TemplateType.Task},
    },
    labels: [
      ...baseTemplate.labels,
      {
        id: '1',
        name: 'influx.task',
        properties: {
          color: 'ffb3b3',
          description: 'This is a template for a task resource on influx 2.0',
        },
      },
    ],
  }
}

export const labelToRelationship = (l: Label) => {
  return {type: TemplateType.Label, id: l.id}
}

export const labelToIncluded = (l: Label) => {
  return {
    type: TemplateType.Label,
    id: l.id,
    attributes: {
      name: l.name,
      properties: l.properties,
    },
  }
}

export const taskToTemplate = (
  task: Task,
  baseTemplate = blankTaskTemplate()
): ITemplate => {
  const taskName = _.get(task, 'name', '')
  const templateName = `${taskName}-Template`

  const taskAttributes = _.pick(task, [
    'status',
    'name',
    'flux',
    'every',
    'cron',
    'offset',
  ])

  const labels = getDeep<Label[]>(task, 'labels', [])
  const includedLabels = labels.map(l => labelToIncluded(l))
  const relationshipsLabels = labels.map(l => labelToRelationship(l))

  const template = {
    ...baseTemplate,
    meta: {
      ...baseTemplate.meta,
      name: templateName,
      version: CURRENT_TEMPLATE_VERSION,
      description: `template created from task: ${taskName}`,
    },
    content: {
      ...baseTemplate.content,
      data: {
        ...baseTemplate.content.data,
        type: TemplateType.Task,
        attributes: taskAttributes,
        relationships: {
          [TemplateType.Label]: {data: relationshipsLabels},
        },
      },
      included: [...baseTemplate.content.included, ...includedLabels],
    },
  }

  return template
}

const viewToIncluded = (view: View) => ({
  type: TemplateType.View,
  id: view.id,
  attributes: view
})
const viewToRelationship = (view: View) => ({
  type: TemplateType.View, id: view.id
})


const cellToIncluded = (cell: Cell, views: View[]) =>  {
  const cellView = views.find(v => v.id === cell.id)
  const viewRelationship = viewToRelationship(cellView)

  return {
    id: cell.id,
    type: TemplateType.Cell,
    attributes: cell,
    relationships: {
      [TemplateType.View]: {
        data: viewRelationship
      }
    }
  }
}

const cellToRelationship = (cell: Cell) => ({
  type: TemplateType.Cell, id: cell.id
})

// Todo: update template to match task format
export const dashboardToTemplate = (
  dashboard: Dashboard,
  views: View[],
  baseTemplate = blankTaskTemplate(),
) => {
  const dashboardName = _.get(dashboard, 'name', '')
  const templateName = `${dashboardName}-Template`

  const dashboardAttributes = _.pick(dashboard, [
    'name',
    'description',
  ])

  const labels = getDeep<Label[]>(dashboard, 'labels', [])
  const includedLabels = labels.map(l => labelToIncluded(l))
  const relationshipsLabels = labels.map(l => labelToRelationship(l))

  const cells = getDeep<Cell[]>(dashboard, 'cells', [])
  const includedCells = cells.map(c => cellToIncluded(c, views))
  const relationshipsCells = cells.map(c => cellToRelationship(c))

  const includedViews = views.map(v => viewToIncluded(v))

  const template = {
    ...baseTemplate,
    meta: {
      ...baseTemplate.meta,
      name: templateName,
      version: CURRENT_TEMPLATE_VERSION,
      description: `template created from dashboard: ${dashboardName}`,
    },
    content: {
      ...baseTemplate.content,
      data: {
        ...baseTemplate.content.data,
        type: TemplateType.Dashboard,
        attributes: dashboardAttributes,
        relationships: {
          [TemplateType.Label]: {data: relationshipsLabels},
          [TemplateType.Cell]: {data: relationshipsCells}
        },
      },
      included: [
        ...baseTemplate.content.included,
        ...includedLabels,
        ...includedCells,
        ...includedViews
      ],
    },
  }

  return template
}
