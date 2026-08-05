import { useDispatch } from "react-redux";
import { billing, verifyPayment } from "../services/billing.api.js";
import { setLoading, setUser, setError } from "../../../authSlice.js";

const useBilling = () => {
  const dispatch = useDispatch();

  const handleBilling = async (planType) => {
    try {
      dispatch(setLoading(true));
      const data = await billing(planType);
      
      const checkoutUrl = data.checkoutUrl || data.url;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to initiate billing";
      dispatch(setError(errorMessage));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleVerifyPayment = async (sessionId) => {
    try {
      const data = await verifyPayment(sessionId);
      if (data && data.success && data.user) {
        dispatch(setUser(data.user));
      }
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to verify payment";
      dispatch(setError(errorMessage));
      throw error;
    }
  };

  return {
    handleBilling,
    handleVerifyPayment,
  };
};

export default useBilling;