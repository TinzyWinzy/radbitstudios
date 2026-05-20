import { describe, it, expect } from "vitest";
import { canAccessByTier, hasRole, ROLE_PERMISSIONS } from "@/services/permissions";

describe("canAccessByTier", () => {
  it("Free can access Free features", () => {
    expect(canAccessByTier("Free", "Free")).toBe(true);
  });

  it("Free cannot access Growth features", () => {
    expect(canAccessByTier("Free", "Growth")).toBe(false);
  });

  it("Growth can access Free features", () => {
    expect(canAccessByTier("Growth", "Free")).toBe(true);
  });

  it("Growth can access Growth features", () => {
    expect(canAccessByTier("Growth", "Growth")).toBe(true);
  });

  it("Growth cannot access Pro features", () => {
    expect(canAccessByTier("Growth", "Pro")).toBe(false);
  });

  it("Pro can access Growth features", () => {
    expect(canAccessByTier("Pro", "Growth")).toBe(true);
  });

  it("Enterprise can access Pro features", () => {
    expect(canAccessByTier("Enterprise", "Pro")).toBe(true);
  });

  it("Enterprise can access Enterprise features", () => {
    expect(canAccessByTier("Enterprise", "Enterprise")).toBe(true);
  });
});

describe("hasRole", () => {
  it("returns true when roles match", () => {
    expect(hasRole("admin", "admin")).toBe(true);
    expect(hasRole("sme_owner", "sme_owner")).toBe(true);
    expect(hasRole("sme_staff", "sme_staff")).toBe(true);
  });

  it("returns false when roles differ", () => {
    expect(hasRole("sme_owner", "admin")).toBe(false);
    expect(hasRole("sme_staff", "sme_owner")).toBe(false);
  });

  it("returns false when user role is null", () => {
    expect(hasRole(null, "sme_owner")).toBe(false);
  });
});

describe("ROLE_PERMISSIONS", () => {
  it("admin can manage blog and access messages", () => {
    expect(ROLE_PERMISSIONS.admin.canManageBlog).toBe(true);
    expect(ROLE_PERMISSIONS.admin.canAccessMessages).toBe(true);
  });

  it("sme_owner can access messages but not manage blog", () => {
    expect(ROLE_PERMISSIONS.sme_owner.canManageBlog).toBe(false);
    expect(ROLE_PERMISSIONS.sme_owner.canAccessMessages).toBe(true);
  });

  it("sme_staff cannot manage blog or access messages", () => {
    expect(ROLE_PERMISSIONS.sme_staff.canManageBlog).toBe(false);
    expect(ROLE_PERMISSIONS.sme_staff.canAccessMessages).toBe(false);
  });
});
