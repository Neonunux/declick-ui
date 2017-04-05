import R from 'ramda'
import * as types from './mutation-types.js'

var mutations = types

export default {
  [mutations.SET_CURRENT_USER_PROJECTS] (state, payload) {
    state.currentUserProjects = payload.projects
  },
  [mutations.SET_CURRENT_PROJECT] (state, payload) {
    state.currentProject = payload.project
  },
  [types.SET_CURRENT_STEP_RESULT] (state, payload) {
    let steps = flattenTree(state.steps, 'steps')
    let step = R.find(R.propEq('position', state.currentStep.position), steps)
    if (step) {
      step.visited = true
      if (payload.passed) {
        step.passed = payload.passed
      }
      if (payload.solution) {
        step.solution = payload.solution
      }
    }
  },
  [types.SET_EDITOR] (state, value) {
    state.editor = value
  },
  [types.SET_STEPS] (state, steps) {
    state.steps = steps
  },
  [types.SET_CURRENT_STEP] (state, position) {
    let steps = flattenTree(state.steps, 'steps')
    let step = R.find(R.propEq('position', position), steps)
    state.currentStep = step || null
  },
  [types.UPDATE_STEP_STATE] (state, value) {
    if (typeof value.visited !== 'undefined') {
      state.currentStep.visited = value.visited
    }
    if (typeof value.passed !== 'undefined') {
      state.currentStep.passed = value.passed
    }
  },
  [types.AUTHENTICATION_FAILURE] (state, payload) {
    state.logInErrors = payload.errors
  },
  [types.AUTHENTICATION_SUCCESS] (state, token) {
    state.logInErrors = null
    state.authorizations = token
    state.connected = true
    state.error_code = 0
    localStorage.setItem('authorizations', state.authorizations)
  },
  [types.CURRENT_PROJECT] (state, project) {
    state.current_project = project
  },
  [types.SET_LISTS] (state, lists) {
    state.lists = lists.body
    state.current_page = lists.body.current_page
    state.last_page = lists.body.last_page
  },
  [types.GET_USERS_ID] (state, user) {
    state.get_user_id = user
  },
  [types.SET_USER] (state, user) {
    state.authenticatedUser = user
    localStorage.setItem('user',
      user.default_project_id + '/' +
      user.email + '/' +
      user.id + '/' +
      user.username
    )
  },
  [types.LOG_OUT] (state) {
    localStorage.removeItem('user')
    localStorage.removeItem('authorizations')
    state.authenticatedUser = null
    state.authorizations = ''
    state.connected = false
  },
  [types.ERROR] (state, error) {
    state.error_code = error.status
  }
}

function flattenTree (tree, key) {
  const level = element => element[key]
    ? [element, element[key].map(level)]
    : element
  return R.flatten(tree.map(level))
}
