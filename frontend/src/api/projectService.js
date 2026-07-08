import API from './axios';

export const getProjects = async () => {
    const res = await API.get('/projects');
    return res.data;
};

export const createProject = async (projectData) => {
    const response = await API.post('/projects', projectData);
    return response.data;
};

export const updateProject = async (id, data) => {
    const res = await API.put(`/projects/${id}`, data);
    return res.data;
};

export const deleteProject = async (id) => {
    await API.delete(`/projects/${id}`);
};