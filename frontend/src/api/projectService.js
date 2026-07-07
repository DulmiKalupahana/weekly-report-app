import API from './axios';

export const getProjects = async () => {
    const res = await API.get('/projects');
    return res.data;
};

export const createProject = async (data) => {
    const res = await API.post('/projects', data);
    return res.data;
};

export const updateProject = async (id, data) => {
    const res = await API.put(`/projects/${id}`, data);
    return res.data;
};

export const deleteProject = async (id) => {
    await API.delete(`/projects/${id}`);
};
