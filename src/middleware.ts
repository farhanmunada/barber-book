import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "barber-craft-ultra-secure-key-32-chars-long!"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("barber_session")?.value;

  // Protect all /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(sessionToken, SECRET_KEY, {
        algorithms: ["HS256"],
      });
      const role = payload.role as string;
      const branchId = payload.branchId as string | undefined;

      // 1. Guard /dashboard/admin (Only Admin can manage branches, services, staff accounts)
      if (pathname.startsWith("/dashboard/admin")) {
        if (role !== "admin") {
          // If owner or staff tries to open admin, redirect to their respective view
          if (role === "owner") {
            return NextResponse.redirect(new URL("/dashboard/owner", request.url));
          }
          if (role === "staff") {
            return NextResponse.redirect(
              new URL(`/dashboard/branch/${branchId || "branch-kemang"}/queue`, request.url)
            );
          }
          return NextResponse.redirect(new URL("/book", request.url));
        }
      }

      // 2. Guard /dashboard/owner (Owner and Admin can view analytics; Staff & Customer cannot)
      if (pathname.startsWith("/dashboard/owner")) {
        if (role !== "owner" && role !== "admin") {
          if (role === "staff") {
            return NextResponse.redirect(
              new URL(`/dashboard/branch/${branchId || "branch-kemang"}/queue`, request.url)
            );
          }
          return NextResponse.redirect(new URL("/book", request.url));
        }
      }

      // 3. Guard /dashboard/branch (Staff and Admin only; Customer and pure Owner cannot tamper POS)
      if (pathname.startsWith("/dashboard/branch")) {
        if (role === "customer") {
          return NextResponse.redirect(new URL("/book", request.url));
        }
      }
    } catch {
      // Invalid/expired token
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
