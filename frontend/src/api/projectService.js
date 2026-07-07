import API from './axios';

export const getProjects = async () => {
    const res = await API.get('/projects');
    return res.data;
};

export const createProject = async (name) => {
    const res = await API.post('/projects', { name });
    return res.data;
};

export const updateProject = async (id, name) => {
    const res = await API.put(`/projects/${id}`, { name });
    return res.data;
};

export const deleteProject = async (id) => {
    await API.delete(`/projects/${id}`);
};
