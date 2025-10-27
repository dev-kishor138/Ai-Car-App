import axios from "axios";

const PYTHON_API_BASE = process.env.PYTHON_API_URL || "http://127.0.0.1:8000";

// analyze Cars
export const analyzeCars = async (req, res, next) => {
  try {
    const response = await axios.post(
      `${PYTHON_API_BASE}/analyze-cars/`,
      req.body
    );
    res.status(200).json(response.data);
  } catch (error) {
    next(error);
  }
};

// compare Cars
export const compareCarsAI = async (req, res, next) => {
  try {
    const response = await axios.post(
      `${PYTHON_API_BASE}/compare-cars/`,
      req.body
    );
    res.status(200).json(response.data);
  } catch (error) {
    next(error);
  }
};

// Ai Suggest
export const aiSuggest = async (req, res, next) => {
  try {
    const response = await axios.post(
      `${PYTHON_API_BASE}/ai-suggest/`,
      req.body
    );
    res.status(200).json(response.data);
  } catch (error) {
    next(error);
  }
};
