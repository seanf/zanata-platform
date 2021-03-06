import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { isUndefined, size, map } from 'lodash'
import ReactList from 'react-list'
import {
  Page,
  ScrollView,
  View,
  Row,
  LoaderText,
  Icon,
  Select
} from 'zanata-ui'
import { Notification } from '../../components/'
import { Button } from 'react-bootstrap'
import {
  glossaryDeleteTerm,
  glossaryResetTerm,
  glossarySelectTerm,
  glossaryUpdateField,
  glossaryUpdateTerm,
  glossaryGoFirstPage,
  glossaryGoLastPage,
  glossaryGoNextPage,
  glossaryGoPreviousPage,
  glossaryInitialLoad,
  glossaryUpdatePageSize,
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_SELECTION
} from '../../actions/glossary'
import ViewHeader from './ViewHeader'
import Entry from './Entry'

const loadingContainerTheme = {
  base: {
    ai: 'Ai(c)',
    flxg: 'Flxg(1)',
    jc: 'Jc(c)',
    w: 'W(100%)'
  }
}
/**
 * Root component for Glossary page
 */
class Glossary extends Component {
  componentDidMount () {
    const paramProjectSlug = this.props.params.projectSlug
    const projectSlug = (!paramProjectSlug || paramProjectSlug === 'undefined')
      ? undefined : paramProjectSlug

    this.props.handleInitLoad(projectSlug)
  }

  /**
   * Force component to update when changes between project glossary to glossary
   */
  componentDidUpdate (prevProps, prevState) {
    const projectSlug = this.props.params.projectSlug
    if (prevProps.params.projectSlug !== projectSlug) {
      this.props.handleInitLoad(projectSlug)
    }
  }

  renderItem (index, key) {
    const {
      handleSelectTerm,
      handleTermFieldUpdate,
      handleDeleteTerm,
      handleResetTerm,
      handleUpdateTerm,
      termsLoading,
      termIds,
      terms,
      selectedTransLocale,
      selectedTerm,
      permission,
      saving,
      deleting
    } = this.props
    const entryId = termIds[index]
    const selected = entryId === selectedTerm.id
    const isSaving = !isUndefined(saving[entryId])
    let entry
    if (isSaving && entryId) {
      entry = saving[entryId]
    } else if (selected) {
      entry = selectedTerm
    } else if (entryId) {
      entry = terms[entryId]
    }
    const isDeleting = !isUndefined(deleting[entryId])

    return (
      <Entry {...{
        key,
        entry,
        index,
        selected,
        isDeleting,
        isSaving,
        permission,
        selectedTransLocale,
        termsLoading,
        handleSelectTerm,
        handleTermFieldUpdate,
        handleDeleteTerm,
        handleResetTerm,
        handleUpdateTerm
      }} />
    )
  }

  render () {
    const {
      terms,
      termsLoading,
      termCount,
      notification,
      gotoPreviousPage,
      gotoFirstPage,
      gotoLastPage,
      gotoNextPage,
      page,
      pageSize,
      handlePageSizeChange,
      project
    } = this.props

    const intPageSize = pageSize ? parseInt(pageSize) : PAGE_SIZE_DEFAULT
    const totalPage = Math.floor(termCount / intPageSize) +
      (termCount % intPageSize > 0 ? 1 : 0)
    const currentPage = page ? parseInt(page) : 1
    const displayPaging = totalPage > 1
    const pageSizeOption = map(PAGE_SIZE_SELECTION, (size) => {
      return {label: size, value: size}
    })
    const headerTitle = project ? 'Project Glossary' : 'Glossary'
    let list

    /* eslint-disable react/jsx-no-bind */
    if (termsLoading) {
      list = (<View theme={loadingContainerTheme}>
        <LoaderText loading loadingText='Loading' />
      </View>)
    } else if (!termsLoading && termCount) {
      list = (<ReactList
        useTranslate3d
        itemRenderer={::this.renderItem}
        length={size(terms)}
        type='uniform'
        ref={(c) => { this.list = c }} />)
    } else {
      list = (<View theme={loadingContainerTheme}>
        <span className='Mb(rq) C(muted)'>
          <Icon name='glossary' size='6' />
        </span>
        <p className='C(muted)'>No content</p>
      </View>)
    }

    return (
      <Page>
        {notification &&
          (<Notification severity={notification.severity}
            message={notification.message}
            details={notification.details}
            show={!!notification} />
          )
        }
        <Helmet title={headerTitle} />
        <ScrollView>
          <ViewHeader title={headerTitle} />
          <View theme={{ base: {p: 'Pt(r6)--sm Pt(r4)', fld: 'Fld(rr)'} }}>
            <Row>
              {termCount > 0 &&
                <Row>
                  <span className='Hidden--lesm Pend(rq)'>Show</span>
                  <Select options={pageSizeOption}
                    placeholder='Terms per page'
                    value={intPageSize}
                    name='glossary-page'
                    className='Mend(re) W(ms8)'
                    searchable={false}
                    clearable={false}
                    onChange={handlePageSizeChange} />
                </Row>
              }
              {displayPaging &&
                <div className='D(f)'>
                  <Button bsStyle='link' disabled={currentPage <= 1}
                    title='First page'
                    onClick={() => { gotoFirstPage(currentPage, totalPage) }}>
                    <Icon name='previous' size='1' />
                  </Button>
                  <Button bsStyle='link' disabled={currentPage <= 1}
                    title='Previous page'
                    onClick={
                    () => { gotoPreviousPage(currentPage, totalPage) }}>
                    <Icon name='chevron-left' size='1' />
                  </Button>
                  <span className='C(muted) Mx(re)'>
                    {currentPage} of {totalPage}
                  </span>
                  <Button bsStyle='link' disabled={currentPage === totalPage}
                    title='Next page'
                    onClick={() => { gotoNextPage(currentPage, totalPage) }}>
                    <Icon name='chevron-right' size='1' />
                  </Button>
                  <Button bsStyle='link' disabled={currentPage === totalPage}
                    title='Last page'
                    onClick={() => { gotoLastPage(currentPage, totalPage) }}>
                    <Icon name='next' size='1' />
                  </Button>
                  <span className='Mx(rq) C(muted)'
                    title='Total glossary terms'>
                    <Row>
                      <Icon name='glossary' size='1' /> {termCount}
                    </Row>
                  </span>
                </div>
                }
            </Row>
          </View>

          <View theme={{ base: {p: 'Pb(r2)'} }}>
            {list}
          </View>
        </ScrollView>
      </Page>
    )
    /* eslint-enable react/jsx-no-bind */
  }
}

Glossary.propTypes = {
  /**
   * Object of glossary id with term
   */
  terms: PropTypes.object,
  project: PropTypes.object,
  params: PropTypes.object,
  termIds: PropTypes.array,
  termCount: PropTypes.number,
  termsLoading: PropTypes.bool,
  transLocales: PropTypes.array,
  srcLocale: PropTypes.object,
  filterText: PropTypes.string,
  selectedTerm: PropTypes.object,
  selectedTransLocale: PropTypes.string,
  permission: PropTypes.object,
  location: PropTypes.object,
  saving: PropTypes.object,
  deleting: PropTypes.object,
  notification: PropTypes.object,
  goPreviousPage: PropTypes.func,
  goFirstPage: PropTypes.func,
  goLastPage: PropTypes.func,
  goNextPage: PropTypes.func,
  handleInitLoad: PropTypes.func,
  handleSelectTerm: PropTypes.func,
  handleTermFieldUpdate: PropTypes.func,
  handleDeleteTerm: PropTypes.func,
  handleResetTerm: PropTypes.func,
  handleUpdateTerm: PropTypes.func,
  handlePageSizeChange: PropTypes.func,
  page: PropTypes.string,
  gotoPreviousPage: PropTypes.func,
  gotoFirstPage: PropTypes.func,
  gotoLastPage: PropTypes.func,
  gotoNextPage: PropTypes.func,
  pageSize: PropTypes.string
}

const mapStateToProps = (state) => {
  const {
    selectedTerm,
    stats,
    terms,
    termIds,
    filter,
    permission,
    termsLoading,
    termCount,
    saving,
    deleting,
    notification,
    project
  } = state.glossary
  const query = state.routing.location.query
  return {
    terms,
    termIds,
    termCount,
    termsLoading,
    transLocales: stats.transLocales,
    srcLocale: stats.srcLocale,
    filterText: filter,
    selectedTerm: selectedTerm,
    selectedTransLocale: query.locale,
    permission,
    location: state.routing.location,
    saving,
    deleting,
    notification,
    page: query.page,
    pageSize: query.size,
    project
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleInitLoad: (projectSlug) => {
      dispatch(glossaryInitialLoad(projectSlug))
    },
    handleSelectTerm: (termId) => dispatch(glossarySelectTerm(termId)),
    handleTermFieldUpdate: (field, event) => {
      dispatch(glossaryUpdateField({ field, value: event.target.value || '' }))
    },
    handleDeleteTerm: (termId) => dispatch(glossaryDeleteTerm(termId)),
    handleResetTerm: (termId) => dispatch(glossaryResetTerm(termId)),
    handleUpdateTerm: (term, needRefresh) =>
      dispatch(glossaryUpdateTerm(term, needRefresh)),
    handlePageSizeChange: (size) =>
      dispatch(glossaryUpdatePageSize(size.value)),
    gotoFirstPage: (currentPage, totalPage) =>
      dispatch(glossaryGoFirstPage(currentPage, totalPage)),
    gotoPreviousPage: (currentPage, totalPage) =>
      dispatch(glossaryGoPreviousPage(currentPage, totalPage)),
    gotoNextPage: (currentPage, totalPage) =>
      dispatch(glossaryGoNextPage(currentPage, totalPage)),
    gotoLastPage: (currentPage, totalPage) =>
      dispatch(glossaryGoLastPage(currentPage, totalPage))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Glossary)
