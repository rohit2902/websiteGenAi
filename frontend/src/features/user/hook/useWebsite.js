import { useDispatch, useSelector } from "react-redux";
import { updateCredits } from "../../../authSlice.js";
import {
  setLoading,
  setIsEditing,
  setWebsites,
  setCurrentWebsite,
  setConversation,
  addWebsite,
  updateWebsite,
  removeWebsite,
  setError,
} from "../websiteSlice.js";
import {
  generateWebsite as generateWebsiteApi,
  editWebsite as editWebsiteApi,
  getUserWebsites as getUserWebsitesApi,
  getWebsite as getWebsiteApi,
  renameWebsite as renameWebsiteApi,
  deleteWebsite as deleteWebsiteApi,
  duplicateWebsite as duplicateWebsiteApi,
  deployWebsite as deployWebsiteApi,
  downloadWebsiteZip as downloadWebsiteZipApi,
  updateWebsiteFile as updateWebsiteFileApi,
} from "../services/website.api.js";

const useWebsite = () => {
  const dispatch = useDispatch();
  const { websites, currentWebsite, conversation, loading, isEditing, error } =
    useSelector((state) => state.website);
  const { user } = useSelector((state) => state.auth);

  const handleGenerateWebsite = async (prompt) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const data = await generateWebsiteApi(prompt);

      if (data.website) {
        dispatch(setCurrentWebsite(data.website));
        dispatch(addWebsite(data.website));
      }

      if (typeof data.remainingCredit === "number") {
        dispatch(updateCredits(data.remainingCredit));
      }

      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      dispatch(setError(errMsg));
      throw new Error(errMsg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleEditWebsite = async (id, prompt) => {
    try {
      dispatch(setIsEditing(true));
      dispatch(setError(null));

      const data = await editWebsiteApi(id, prompt);

      if (data.website) {
        dispatch(setCurrentWebsite(data.website));
        dispatch(updateWebsite(data.website));
      }

      if (data.conversation) {
        dispatch(setConversation(data.conversation));
      }

      if (typeof data.remainingCredit === "number") {
        dispatch(updateCredits(data.remainingCredit));
      }

      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      dispatch(setError(errMsg));
      throw new Error(errMsg);
    } finally {
      dispatch(setIsEditing(false));
    }
  };

  const handleGetUserWebsites = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const data = await getUserWebsitesApi();

      if (data.websites) {
        dispatch(setWebsites(data.websites));
      }

      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      dispatch(setError(errMsg));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGetWebsite = async (id) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const data = await getWebsiteApi(id);

      if (data.website) {
        dispatch(setCurrentWebsite(data.website));
      }

      if (data.conversation) {
        dispatch(setConversation(data.conversation));
      }

      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      dispatch(setError(errMsg));
      return null;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleRenameWebsite = async (id, title) => {
    try {
      dispatch(setError(null));
      const data = await renameWebsiteApi(id, title);

      if (data.website) {
        dispatch(updateWebsite(data.website));
      }

      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      dispatch(setError(errMsg));
      throw new Error(errMsg);
    }
  };

  const handleDeleteWebsite = async (id) => {
    try {
      dispatch(setError(null));
      const data = await deleteWebsiteApi(id);

      dispatch(removeWebsite(id));
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      dispatch(setError(errMsg));
      throw new Error(errMsg);
    }
  };

  const handleDuplicateWebsite = async (id) => {
    try {
      dispatch(setError(null));
      const data = await duplicateWebsiteApi(id);

      if (data.website) {
        dispatch(addWebsite(data.website));
      }

      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      dispatch(setError(errMsg));
      throw new Error(errMsg);
    }
  };

  const handleDeployWebsite = async (id, target) => {
    try {
      dispatch(setError(null));
      const data = await deployWebsiteApi(id, target);

      if (data.website) {
        dispatch(updateWebsite(data.website));
      }

      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      dispatch(setError(errMsg));
      throw new Error(errMsg);
    }
  };

  const handleDownloadZip = async (id, title = "website") => {
    try {
      const response = await downloadWebsiteZipApi(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const cleanName = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      link.setAttribute("download", `${cleanName}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Zip download error:", err);
      alert("Failed to download project ZIP archive");
    }
  };

  const handleUpdateFile = async (id, path, content) => {
    try {
      dispatch(setError(null));
      const data = await updateWebsiteFileApi(id, path, content);

      if (data.website) {
        dispatch(setCurrentWebsite(data.website));
        dispatch(updateWebsite(data.website));
      }

      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      dispatch(setError(errMsg));
      throw new Error(errMsg);
    }
  };

  return {
    websites,
    currentWebsite,
    conversation,
    loading,
    isEditing,
    error,
    userCredits: user?.credit ?? 0,
    handleGenerateWebsite,
    handleEditWebsite,
    handleGetUserWebsites,
    handleGetWebsite,
    handleRenameWebsite,
    handleDeleteWebsite,
    handleDuplicateWebsite,
    handleDeployWebsite,
    handleDownloadZip,
    handleUpdateFile,
  };
};

export default useWebsite;