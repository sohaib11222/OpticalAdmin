import Workspace from "@/pages/workspace/Workspace";
import Operations from "@/pages/foundation/Operations";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { Button, Alert } from "react-bootstrap";
import { useAuthContext } from "@/context/useAuthContext";
import { useTranslation } from "@/i18n";
import AdminLayout from "@/layouts/AdminLayout";
import AuthLayout from "@/layouts/AuthLayout";
import AuthPage from "@/pages/foundation/AuthPage";
import VerifyPage from "@/pages/foundation/VerifyPage";
import Home from "@/pages/foundation/Home";
import Security from "@/pages/foundation/Security";
function Protected({ children }: { children: ReactNode }) {
  const { user, loading, isAuthenticated, error, refresh } = useAuthContext();
  const { t, translateMessage } = useTranslation();
  const location = useLocation();
  if (loading)
    return (
      <p role="status" className="p-4">
        {t("common.loading")}
      </p>
    );
  if (error && !user)
    return (
      <Alert variant="danger" role="alert">
        {translateMessage(error)}
        <Button onClick={() => void refresh()}>{t("common.retry")}</Button>
      </Alert>
    );
  if (!isAuthenticated)
    return (
      <Navigate
        to={"/auth/sign-in?redirectTo=" + encodeURIComponent(location.pathname)}
        replace
      />
    );
  return (
    <AdminLayout key={user?.id}>
      {error && (
        <Alert variant="warning" role="alert">
          {translateMessage(error)}
          <Button onClick={() => void refresh()}>{t("common.retryConnection")}</Button>
        </Alert>
      )}
      {children}
    </AdminLayout>
  );
}
function NotFound() {
  const { t } = useTranslation();
  return (
    <Protected>
      <Alert variant="warning">{t("common.pageNotFound")}</Alert>
    </Protected>
  );
}
export default function AppRouter() {
  return (
    <Routes>
      <Route
        path="/workspace/:module"
        element={
          <Protected>
            <Workspace />
          </Protected>
        }
      />
      <Route
        path="/auth/sign-in"
        element={
          <AuthLayout>
            <AuthPage mode="login" />
          </AuthLayout>
        }
      />
      <Route
        path="/auth/forgot-password"
        element={
          <AuthLayout>
            <AuthPage mode="forgot" />
          </AuthLayout>
        }
      />
      <Route
        path="/auth/reset-password"
        element={
          <AuthLayout>
            <AuthPage mode="reset" />
          </AuthLayout>
        }
      />
      <Route
        path="/auth/verify-email"
        element={
          <AuthLayout>
            <VerifyPage />
          </AuthLayout>
        }
      />
      <Route
        path="/"
        element={
          <Protected>
            <Home />
          </Protected>
        }
      />
      <Route
        path="/operations"
        element={
          <Protected>
            <Operations />
          </Protected>
        }
      />
      <Route
        path="/account/security"
        element={
          <Protected>
            <Security />
          </Protected>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
