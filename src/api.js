import Vue from 'vue'
import VueResource from 'vue-resource'
import config from 'assets/config/declick'

Vue.use(VueResource)

export default {
  // tokens methods
  async createToken (username, password) {
    let endpoint = `${config.apiUrl}v1/login`
    let {body: {token}} = await Vue.http.post(endpoint, {username, password})
    return token
  },
  async destroyToken (token) {
    let endpoint = `${config.apiUrl}v1/logout`
    await Vue.http.post(endpoint, {headers: {Authorization: 'Token ' + token}})
  },

  // users methods
  async createUser ({username, email, password}) {
    let endpoint = `${config.apiUrl}v1/users`
    await Vue.http.post(endpoint, {username, email, password})
  },
  async updateUser (id, data, token) {
    let endpoint = `${config.apiUrl}v1/users/${id}`
    let body = {
      email: data.email,
      id_admin: data.isAdmin,
      default_project_id: data.defaultProjectId,
      current_project_id: data.currentProjectId
    }
    let {body: user} = await Vue.http.patch(
      endpoint,
      body,
      {headers: {Authorization: 'Token ' + token}}
    )
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.is_admin,
      defaultProjectId: user.default_project_id,
      currentProjectId: user.current_project_id
    }
  },
  async getUsersByPage (page, filter) {
    let endpoint = `${config.apiUrl}v1/users?page=${page}`
    if (filter && filter !== '') {
      endpoint += `&search=${filter}`
    }
    let {body: result} = await Vue.http.get(endpoint)
    let users = result.data.map(user => {
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.is_admin,
        defaultProjectId: user.default_project_id,
        currentProjectId: user.current_project_id
      }
    })
    return {
      items: users,
      currentPage: page.current_page,
      lastPage: page.last_page
    }
  },
  async getUser (id) {
    let endpoint = `${config.apiUrl}v1/users/${id}`
    let {body: user} = await Vue.http.get(endpoint)
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      defaultProjectId: user.default_project_id,
      currentProjectId: user.current_project_id,
      isAdmin: user.is_admin
    }
  },
  async getUserByToken (token) {
    let endpoint = `${config.apiUrl}v1/users/me`
    let {body: user} = await Vue.http.get(
      endpoint,
      {headers: {Authorization: 'Token ' + token}}
    )
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      defaultProjectId: user.default_project_id,
      currentProjectId: user.current_project_id,
      isAdmin: user.is_admin
    }
  },

  // projects methods
  async createProject (data, token) {
    let endpoint = `${config.apiUrl}v1/projects`
    let body = {
      name: data.name,
      is_public: data.isPublic,
      scene_width: data.sceneWidth,
      scene_height: data.sceneHeight,
      description: data.description,
      instructions: data.instructions
    }
    let {body: project} = await Vue.http.post(
      endpoint,
      body,
      {headers: {Authorization: 'Token ' + token}}
    )
    return {
      id: project.id,
      name: project.name,
      isPublic: project.is_public,
      sceneWidth: project.scene_width,
      sceneHeight: project.scene_height,
      description: project.description,
      instructions: project.instructions
    }
  },
  async updateProject (id, data, token) {
    let endpoint = `${config.apiUrl}v1/projects/${id}`
    let body = {
      name: data.name,
      is_public: data.isPublic,
      scene_width: data.sceneWidth,
      scene_height: data.sceneHeight,
      description: data.description,
      instructions: data.instructions
    }
    let {body: project} = await Vue.http.patch(
      endpoint,
      body,
      {headers: {Authorization: 'Token ' + token}}
    )
    return {
      id: project.id,
      name: project.name,
      isPublic: project.is_public,
      sceneWidth: project.scene_width,
      sceneHeight: project.scene_height,
      description: project.description,
      instructions: project.instructions
    }
  },
  async getProject (id, token) {
    let endpoint = `${config.apiUrl}v1/projects/${id}`
    let {body: project} = await Vue.http.get(
      endpoint,
      {headers: {Authorization: 'Token ' + token}}
    )
    return {
      id: project.id,
      name: project.name,
      isPublic: project.is_public,
      sceneWidth: project.scene_width,
      sceneHeight: project.scene_height,
      description: project.description,
      instructions: project.instructions
    }
  },
  async getAllUserProjects (id, token) {
    let endpoint = `${config.apiUrl}v1/users/${id}/projects`
    let {body: projects} = await Vue.http.get(
      endpoint,
      {headers: {Authorization: 'Token ' + token}}
    )
    return projects.map(project => {
      return {
        id: project.id,
        name: project.name,
        isPublic: project.is_public,
        sceneWidth: project.scene_width,
        sceneHeight: project.scene_height,
        description: project.description,
        instructions: project.instructions
      }
    })
  },

  // courses methods
  async getAllCourses () {
    let {body: courses} = await Vue.http.get(`${config.apiUrl}v1/circuits`)
    return courses.map(course => {
      return {
        id: course.id,
        name: course.name,
        imageUrl: 'http://www.declick.net/images/default-level.png',
        summary: course.short_description,
        details: course.description
      }
    })
  },

  // assessments methods
  async registerAssessmentResult (
    userId,
    assessmentId,
    data,
    token
  ) {
    let endpoint = `${config.apiUrl}v1/users/${userId}/results`
    let body = {
      step_id: assessmentId,
      passed: data.passed,
      solution: data.solution
    }
    await Vue.http.post(
      endpoint,
      body,
      {headers: {Authorization: 'Token ' + token}}
    )
  },
  async getAllCourseAssessments (id) {
    let endpoint = `${config.apiUrl}v1/circuits/${id}/nodes`
    let {body} = await Vue.http.get(endpoint)
    let assessments = body.map(assessment => {
      return {
        id: assessment.id,
        name: assessment.name,
        url: assessment.link,
        circuitId: assessment.circuit_id,
        parentId: assessment.parent_id,
        position: assessment.position
      }
    })
    let root = assessments.filter(
      assessments => assessments.parentId === null
    )[0]
    let result = orderAssessments(assessments, root)
    return result
  },

  // results methods
  async getAllUserResults (id, token) {
    let endpoint = `${config.apiUrl}v1/circuits/${id}/nodes`
    let {body: results} = await Vue.http.get(
      endpoint,
      {headers: {Authorization: 'Token ' + token}}
    )
    return results
  }
}

function orderAssessments (assessments, root, state) {
  if (!state) {
    state = {
      stack: [],
      count: 0
    }
  }
  assessments.filter(
    assessment => assessment.parentId === root.id
  ).sort((assessmentA, assessmentB) =>
    assessmentA.position > assessmentB.position
  ).forEach(assessment => {
    assessment.position = state.count++
    state.stack.push(assessment)
    orderAssessments(assessments, assessment, state)
  })
  return state.stack
}
