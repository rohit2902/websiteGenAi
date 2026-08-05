import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { getMe, LogOut, login } from "../service/auth.api.js";
import {
  setLoading,
  setUser,
  setError,
  logout,
} from "../authSlice.js";

const useAuth = () => {
  const dispatch = useDispatch();

  const handleLogin = async ({ email, name, avatar }) => {
    try {
      dispatch(setLoading(true));
      const data = await login({ email, name, avatar });
      dispatch(setUser(data.user));
      return data;
    } catch (error) {
      dispatch(logout());
      dispatch(setError(error.response?.data?.message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGetMe = useCallback(async (showGlobalLoading = true) => {
    try {
      if (showGlobalLoading) {
        dispatch(setLoading(true));
      }
      const data = await getMe();
      if (data && data.user) {
        dispatch(setUser(data.user));
      }
      return data;
    } catch (error) {
      dispatch(logout());
      dispatch(setError(error.response?.data?.message));
    } finally {
      if (showGlobalLoading) {
        dispatch(setLoading(false));
      }
    }
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      dispatch(setLoading(true));
      await LogOut();
      dispatch(logout());
    } catch (error) {
      dispatch(setError(error.response?.data?.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    handleGetMe,
    handleLogout,
    handleLogin,
  };
};

export default useAuth;