import API from './axios';

export const searchMembers = async (query = '') => {
    const res = await API.get('/auth/users', {
        params: { search: query, role: 'member' }
    });
    return res.data;
};