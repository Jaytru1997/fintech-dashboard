import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import LoginPage from "@/app/auth/login/page";

const mockPush = jest.fn();
const mockSetAuth = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/stores/auth", () => ({
  useAuthStore: jest.fn(),
}));

jest.mock("@/lib/api/endpoints", () => ({
  authApi: {
    login: jest.fn(),
  },
}));

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.MockedFunction<typeof useRouter>).mockReturnValue({
      push: mockPush,
    } as any);
    (useAuthStore as jest.MockedFunction<typeof useAuthStore>).mockReturnValue({
      setAuth: mockSetAuth,
    } as any);
  });

  it("renders login form", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    render(<LoginPage />);
    const submitButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });
});

