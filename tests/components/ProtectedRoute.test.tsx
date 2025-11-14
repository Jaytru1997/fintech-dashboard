import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/stores/auth", () => ({
  useAuthStore: jest.fn(),
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.MockedFunction<typeof useRouter>).mockReturnValue({
      push: mockPush,
    } as any);
  });

  it("redirects to login when not authenticated", () => {
    (useAuthStore as jest.MockedFunction<typeof useAuthStore>).mockReturnValue({
      token: null,
      isAdmin: false,
    } as any);

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });

  it("renders children when authenticated", () => {
    (useAuthStore as jest.MockedFunction<typeof useAuthStore>).mockReturnValue({
      token: "test-token",
      isAdmin: false,
    } as any);

    const { getByText } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(getByText("Protected Content")).toBeInTheDocument();
  });

  it("redirects non-admin users from admin routes", () => {
    (useAuthStore as jest.MockedFunction<typeof useAuthStore>).mockReturnValue({
      token: "test-token",
      isAdmin: false,
    } as any);

    render(
      <ProtectedRoute adminOnly>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });
});

