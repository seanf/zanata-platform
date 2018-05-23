// @ts-nocheck
import React from 'react'
import { Component } from 'react'
import * as PropTypes from 'prop-types'
import {connect} from 'react-redux'
import { differenceWith, isEqual, throttle } from 'lodash'
import {arrayMove} from 'react-sortable-hoc'
import Modal from 'antd/lib/modal'
import 'antd/lib/modal/style/css'
import Button from 'antd/lib/button'
import 'antd/lib/button/style/css'
import Collapse from 'antd/lib/collapse'
import 'antd/lib/collapse/style/css'
import Select from 'antd/lib/select'
import 'antd/lib/select/style/css'
import Row from 'antd/lib/row'
import 'antd/lib/row/style/css'
import Col from 'antd/lib/col'
import 'antd/lib/col/style/css'
import {
  Icon, LoaderText, Link} from '../../components'
import {ProjectVersionHorizontal} from './project-version-displays'
import CancellableProgressBar
  from '../../components/ProgressBar/CancellableProgressBar'
import {
  fetchVersionLocales,
  fetchProjectPage,
  toggleTMMergeModal,
  mergeVersionFromTM,
  queryTMMergeProgress,
  cancelTMMergeRequest,
  currentTMMergeProcessFinished
} from '../../actions/version-actions'
import {
  ProjectType, LocaleType, FromProjectVersionType, processStatusType
} from '../../utils/prop-types-util'
import {isProcessEnded, IGNORE_CHECK, FUZZY} from '../../utils/EnumValueUtils'
import {getVersionLanguageSettingsUrl} from '../../utils/UrlHelper'
import {
  TMMergeOptionsCallbackPropType,
  TMMergeOptionsValuePropType
} from './TMMergeOptionsCommon'
import TMMergeProjectSources from './TMMergeProjectSources'
import TMMergeImportedTM from './TMMergeImportedTM'

const DO_NOT_RENDER = undefined
const docLink =
  'http://docs.zanata.org/en/release/user-guide/versions/version-tm-merge/'
const Panel = Collapse.Panel

/*
 * Component to display TM merge options
 */
const MergeOptions = (
  {
    projectSlug,
    versionSlug,
    projectVersions,
    locales,
    fetchingProject,
    fetchingLocale,
    mergeOptions,
    onDifferentProjectChange,
    onDifferentContextChange,
    onDifferentDocIdChange,
    onImportedTMChange,
    onPercentSelection,
    onLanguageSelection,
    onProjectSearchChange,
    flushProjectSearch,
    onVersionCheckboxChange,
    onAllVersionCheckboxChange,
    onFromAllProjectsChange,
    onDragMoveEnd,
    removeProjectVersion
  }) => {
    //  We set these fields to undefined when closing the modal
    //  Ensure they exist before attempting to render
  const localesSelection =
    locales.length > 0 &&
    mergeOptions.selectedLanguage &&
    !fetchingLocale
    ? (
      <span>
        <Select
          value={mergeOptions.selectedLanguage.localeId}
          style={{ width: '15rem' }}
          onChange={onLanguageSelection}>
          {locales.map((locale) => {
            return (
              <Select.Option value={locale.localeId} >
                {locale.displayName}
              </Select.Option>
            )
          })}
        </Select>
      </span>
    )
    : <LoaderText loading={fetchingLocale}
      loadingText={'Fetching Locales'} />
  return (
    <Row>
      <Col>
        <p className="intro mb2">
          Copy existing <strong>translations</strong> from similar documents
          in other projects and versions into this project version.
          <Link useHref link={docLink} target="_blank">
            <span title='help'>
              <Icon name='help' className='s0' parentClassName='iconHelp' />
              &nbsp;Need help?
            </span>
          </Link>
        </p>
        <Collapse className="mb2">
          <Panel header={
            <span>
              Matching phrases are found in the selected projects and
              imported TM, filtered using the active
              conditions, then the best matching translation is copied to
              the target project-version.&nbsp;[more..]
            </span>
            } eventKey="1">
            <p><img src="https://i.imgur.com/ezA992G.png"
              alt="Version TM Merge workflow" /></p>
          </Panel>
        </Collapse>
      </Col>
      <Col className='mt2'>
        <div className='versionMergeTarget'>
          <div className='VersionMergeTitle'>
            <span className='f4'>To</span>&nbsp;
            <span className="f4 b">Target</span>
          </div>
          <ul className='mt1 mb2'>
            <li className='list-group-item to' title='target project version'>
              <ProjectVersionHorizontal projectSlug={projectSlug}
                versionSlug={versionSlug} />
              <span className='item' id="languageDropdown">
                <Icon name="language" className="s1"
                  parentClassName="iconTMX" />
                <span className="languageDropdown-field">
                  {localesSelection}
                </span>
              </span>
            </li>
          </ul>
        </div>
      </Col>
      <Col>
        <p className="b f4">For every potential translation:</p>
        <div className="di u-textNewBlue mb3">
          If text is less than <Select
            value={mergeOptions.matchPercentage}
            style={{ width: '5rem' }}
            onChange={onPercentSelection}>
            <Select.Option value={75}>75%</Select.Option>
            <Select.Option value={80}>80%</Select.Option>
            <Select.Option value={90}>90%</Select.Option>
            <Select.Option value={100}>100%</Select.Option>
          </Select> similar, don't use it.
        </div>
      </Col>
      <Col>
        <TMMergeProjectSources {...{projectVersions, fetchingProject,
          mergeOptions, onFromAllProjectsChange, onProjectSearchChange,
          flushProjectSearch, onAllVersionCheckboxChange,
          onVersionCheckboxChange, onDragMoveEnd, removeProjectVersion}}
          thisProjectSlug={projectSlug}
          {...mergeOptions}
          {...{onDifferentDocIdChange, onDifferentContextChange,
            onDifferentProjectChange} }
        />
      </Col>
      <TMMergeImportedTM fromImportedTM={mergeOptions.fromImportedTM}
        onImportedTMChange={onImportedTMChange} />
    </Row>
  )
}
MergeOptions.propTypes = {
  projectSlug: PropTypes.string.isRequired,
  versionSlug: PropTypes.string.isRequired,
  locales: PropTypes.arrayOf(LocaleType).isRequired,
  projectVersions: PropTypes.arrayOf(ProjectType).isRequired,
  fetchingProject: PropTypes.bool.isRequired,
  fetchingLocale: PropTypes.bool.isRequired,
  mergeOptions: PropTypes.shape({
    matchPercentage: PropTypes.number.isRequired,
    fromAllProjects: PropTypes.bool.isRequired,
    selectedLanguage: LocaleType,
    selectedVersions: PropTypes.arrayOf(FromProjectVersionType),
    projectSearchTerm: PropTypes.string,
    ...TMMergeOptionsValuePropType
  }).isRequired,
  onFromAllProjectsChange: PropTypes.func.isRequired,
  onPercentSelection: PropTypes.func.isRequired,
  onLanguageSelection: PropTypes.func.isRequired,
  onProjectSearchChange: PropTypes.func.isRequired,
  flushProjectSearch: PropTypes.func.isRequired,
  onVersionCheckboxChange: PropTypes.func.isRequired,
  onAllVersionCheckboxChange: PropTypes.func.isRequired,
  onDragMoveEnd: PropTypes.func.isRequired,
  removeProjectVersion: PropTypes.func.isRequired,
  ...TMMergeOptionsCallbackPropType
}

/**
 * Root component for TM Merge Modal
 */
class TMMergeModal extends Component {
  static propTypes = {
    /* params: projectSlug and versionSlug */
    fetchVersionLocales: PropTypes.func.isRequired,
    showTMMergeModal: PropTypes.bool.isRequired,
    toggleTMMergeModal: PropTypes.func.isRequired,
    /* params: project object */
    fetchProjectPage: PropTypes.func.isRequired,
    projectSlug: PropTypes.string.isRequired,
    versionSlug: PropTypes.string.isRequired,
    locales: PropTypes.arrayOf(LocaleType).isRequired,
    projectVersions: PropTypes.arrayOf(ProjectType).isRequired,
    startMergeProcess: PropTypes.func.isRequired,
    notification: PropTypes.object,
    triggered: PropTypes.bool.isRequired,
    fetchingProject: PropTypes.bool.isRequired,
    fetchingLocale: PropTypes.bool.isRequired,
    onCancelTMMerge: PropTypes.func.isRequired,
    // Not required - set to undefined when merge not in progress
    processStatus: processStatusType,
    queryStatus: PropTypes.string,
    queryTMMergeProgress: PropTypes.func.isRequired,
    mergeProcessFinished: PropTypes.func.isRequired
  }
  defaultState = {
    matchPercentage: 100,
    differentProject: IGNORE_CHECK,
    differentDocId: FUZZY,
    differentContext: FUZZY,
    fromImportedTM: FUZZY,
    fromAllProjects: false,
    selectedLanguage: undefined,
    selectedVersions: [],
    projectSearchTerm: this.props.projectSlug,
    hasMerged: false
  }
  constructor (props) {
    super(props)
    this.state = this.defaultState
    /* Chose 1 second as an arbitrary period between searches.
     * leading and trailing options specify we want to search to after the user
     * stops typing. */
    this.throttleHandleSearch = throttle(props.fetchProjectPage, 1000,
      { 'leading': false })
  }
  componentDidMount () {
    this.props.fetchVersionLocales(
      this.props.projectSlug, this.props.versionSlug)
    this.props.fetchProjectPage(this.state.projectSearchTerm)
  }
  componentWillReceiveProps (nextProps) {
    const { locales, showTMMergeModal } = nextProps
    // Fetch locales again when modal is closed then re-opened
    // Reset the state when the modal is closed
    if (showTMMergeModal !== this.props.showTMMergeModal) {
      if (showTMMergeModal) {
        nextProps.fetchVersionLocales(
        nextProps.projectSlug, nextProps.versionSlug)
      } else {
        // If a merge has run, reload the page to display the merge results
        if (this.state.hasMerged) {
          window.location.reload()
        // Else reset the state to default on modal close
        } else {
          this.setState(this.defaultState)
        }
      }
    }
    if (!this.state.selectedLanguage) {
      this.setState((prevState, props) => ({
        selectedLanguage: locales.length === 0 ? undefined : locales[0]
      }))
    }
    const currentProcessStatus = this.props.processStatus
    if (!isProcessEnded(currentProcessStatus) &&
      isProcessEnded(nextProps.processStatus)) {
      this.setState({
        hasMerged: true
      })
      // process just finished, we want to re-display the merge option form.
      // but we want to delay it a bit so that the user can see the progress
      // bar animation finishes
      setTimeout(this.props.mergeProcessFinished, 1000)
    }
    // Filter out the source project and version if present in search results
    // TODO: perform this filtering on the server side when retrieving projects
    nextProps.projectVersions.map((project) => {
      project.versions = project.versions.filter((version) => {
        return project.id !== nextProps.projectSlug ||
          version.id !== nextProps.versionSlug
      })
    })
  }
  queryTMMergeProgress = () => {
    this.props.queryTMMergeProgress(this.props.processStatus.url)
  }
  cancelTMMerge = () => {
    this.props.onCancelTMMerge(this.props.processStatus.cancelUrl)
  }
  onPercentSelection = (percent) => {
    this.setState({
      matchPercentage: percent
    })
  }
  onLanguageSelection = (language) => {
    this.setState((prevState, props) => {
      return {
        selectedLanguage: this.props.locales.find(
          locale => locale.localeId === language)
      }
    })
  }
  onProjectSearchChange = (textEntered) => {
    this.throttleHandleSearch(textEntered)
    this.setState({
      projectSearchTerm: textEntered
    })
  }
  flushProjectSearch = (event) => {
    if (event.key === 'Enter') {
      this.throttleHandleSearch.flush()
    }
  }
  // Sorts the selectedVersion list after a reorder of the Draggable List
  onDragMoveEnd = ({oldIndex, newIndex}) => {
    this.setState((prevState, props) => ({
      selectedVersions:
        arrayMove(prevState.selectedVersions, oldIndex, newIndex)
    }))
  }
  // Remove a version from fromProjectVersion array
  removeProjectVersion = (project, version) => {
    this.setState((prevState, props) => ({
      selectedVersions: prevState.selectedVersions.filter(({ projectSlug,
       version: { id } }) => projectSlug !== project || id !== version.id)}))
  }
  // Remove all versions of a Project from fromProjectVersion array
  removeAllProjectVersions = (projectSlug) => {
    this.setState((prevState) => {
      return {
        selectedVersions: prevState.selectedVersions
          .filter(p => projectSlug !== p.projectSlug)
      }
    })
  }
  // Add a version to fromProjectVersion array
  pushProjectVersion = (projectVersion) => {
    this.setState((prevState, props) => ({
      selectedVersions: [...prevState.selectedVersions, projectVersion]
    }))
  }
  // Add all versions of a Project to fromProjectVersion array
  pushAllProjectVersions = (projectVersions) => {
    this.setState(prevState => {
      return {
        selectedVersions: prevState.selectedVersions.concat(projectVersions)
      }
    })
  }
  isProjectVersionSelected = (projectSlug, version) => {
    return this.state.selectedVersions
      .find(p => p.projectSlug === projectSlug && p.version.id === version.id)
  }
  // Remove/Add version from fromProjectVersion array based on selection
  onVersionCheckboxChange = (version, projectSlug) => {
    const versionChecked = this.isProjectVersionSelected(projectSlug, version)
    versionChecked ? this.removeProjectVersion(projectSlug, version)
      : this.pushProjectVersion({version, projectSlug: projectSlug})
  }
  // Remove/Add all project versions to version list
  onAllVersionCheckboxChange = (project) => {
    const projectSlug = project.id
    const versionsInProject = project.versions.map((version) => {
      return {version, projectSlug}
    })
    const diff = differenceWith(versionsInProject,
      this.state.selectedVersions, isEqual)
    if (diff.length === 0) {
      // we already have all versions in this project selected,
      // the operation is to remove them all
      this.removeAllProjectVersions(projectSlug)
    } else {
      // we want to add all versions to the selection
      this.pushAllProjectVersions(diff)
    }
  }
  // internal TM can come from all projects
  onFromAllProjectsChange = () => {
    this.setState(prevState => ({
      fromAllProjects: !prevState.fromAllProjects
    }))
  }
  onDifferentProjectChange = (value) => {
    this.setState(prevState => ({
      differentProject: value
    }))
  }
  onDifferentDocIdChange = (value) => {
    this.setState(prevState => ({
      differentDocId: value
    }))
  }
  onDifferentContextChange = (value) => {
    this.setState(prevState => ({
      differentContext: value
    }))
  }
  onImportedTMChange = (value) => () => {
    this.setState(prevState => ({
      fromImportedTM: value
    }))
  }
  submitForm = () => {
    const {projectSlug, versionSlug} = this.props
    this.props.startMergeProcess(projectSlug, versionSlug, this.state)
  }
  render () {
    const {
      showTMMergeModal,
      toggleTMMergeModal,
      projectSlug,
      versionSlug,
      projectVersions,
      locales,
      notification,
      triggered,
      fetchingProject,
      fetchingLocale,
      processStatus
    } = this.props
    const modalBody = processStatus
      ? (
      <CancellableProgressBar onCancelOperation={this.cancelTMMerge}
        processStatus={processStatus} buttonLabel="Cancel TM Merge"
        queryProgress={this.queryTMMergeProgress} />
      )
      : locales.length === 0
      ? <p>This version has no enabled languages. You must enable at least one
        language to use TM merge. <br />
        <a href={getVersionLanguageSettingsUrl(projectSlug, versionSlug)}>
        Language Settings</a></p>
      : (
        <MergeOptions {...{projectSlug, versionSlug, locales, projectVersions,
          fetchingProject, fetchingLocale}}
          mergeOptions={this.state}
          onPercentSelection={this.onPercentSelection}
          onDifferentProjectChange={this.onDifferentProjectChange}
          onDifferentDocIdChange={this.onDifferentDocIdChange}
          onDifferentContextChange={this.onDifferentContextChange}
          onImportedTMChange={this.onImportedTMChange}
          onFromAllProjectsChange={this.onFromAllProjectsChange}
          onAllVersionCheckboxChange={this.onAllVersionCheckboxChange}
          onVersionCheckboxChange={this.onVersionCheckboxChange}
          onLanguageSelection={this.onLanguageSelection}
          onProjectSearchChange={this.onProjectSearchChange}
          flushProjectSearch={this.flushProjectSearch}
          onDragMoveEnd={this.onDragMoveEnd}
          removeProjectVersion={this.removeProjectVersion}
        />
        )
    const hasTMSource = this.state.fromAllProjects ||
      this.state.fromImportedTM || this.state.selectedVersions.length > 0
    const modalFooter = processStatus
    ? DO_NOT_RENDER
    : (
      <span>
        <Row>
          <Button className='btn-link link-danger'
            onClick={toggleTMMergeModal}>
            Close
          </Button>
          <Button type='primary' onClick={this.submitForm}
            disabled={(triggered || !hasTMSource)}>
            Merge translations
          </Button>
        </Row>
      </span>
    )
    return (
      <Modal
        title='Version TM Merge'
        maskClosable={false}
        visible={showTMMergeModal}
        onCancel={toggleTMMergeModal}
        footer={modalFooter}
        width={'48rem'}>
        <span>
          <p className="u-textDanger modalText-danger">
            {notification && notification.message}</p>
          {modalBody}
        </span>
      </Modal>
    )
  }
}

const mapStateToProps = (state) => {
  const {
    projectVersion: {
      locales,
      notification,
      fetchingProject,
      fetchingLocale,
      TMMerge: {
        show,
        triggered,
        projectVersions,
        processStatus,
        queryStatus
      }
    }
  } = state
  return {
    showTMMergeModal: show,
    triggered,
    locales,
    projectVersions,
    notification,
    fetchingProject,
    fetchingLocale,
    processStatus,
    queryStatus
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchVersionLocales: (project, version) => {
      dispatch(fetchVersionLocales(project, version))
    },
    fetchProjectPage: (project) => {
      dispatch(fetchProjectPage(project))
    },
    toggleTMMergeModal: () => {
      dispatch(toggleTMMergeModal())
    },
    startMergeProcess: (projectSlug, versionSlug, mergeOptions) => {
      dispatch(mergeVersionFromTM(projectSlug, versionSlug, mergeOptions))
    },
    queryTMMergeProgress: (url) => {
      dispatch(queryTMMergeProgress(url))
    },
    onCancelTMMerge: (url) => {
      dispatch(cancelTMMergeRequest(url))
    },
    mergeProcessFinished: () => {
      dispatch(currentTMMergeProcessFinished())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TMMergeModal)
