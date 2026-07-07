// frontend/src/api/reportService.js
import API from './axios';

export const submitReport = async (reportData) => {
    const res = await API.post('/reports', reportData);
    return res.data;
};

export const createReport = submitReport;

export const getMyReports = async () => {
    const res = await API.get('/reports/myreports');
    return res.data;
};

export const getAllReports = async () => {
    const res = await API.get('/reports');
    return res.data;
};

export const updateReport = async (id, reportData) => {
    const res = await API.put(`/reports/${id}`, reportData);
    return res.data;
};

export const deleteReport = async (reportId) => {
    const response = await API.delete(`/reports/${reportId}`);
    return response.data;
};