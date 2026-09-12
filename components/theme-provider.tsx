"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type * as React from "react"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // next-themes renders its FOUC-prevention script directly in the React tree, which is
  // fine during SSR (browser executes it before hydration) but triggers a React 19 dev
  // warning on any later client-side render. Making the type non-executable on the client
  // keeps SSR behavior intact while silencing the false-positive warning.
  // https://github.com/pacocoursey/next-themes/issues/385
  const scriptProps = typeof window === "undefined" ? props.scriptProps : { ...props.scriptProps, type: "application/json" }

  return (
    <NextThemesProvider {...props} scriptProps={scriptProps}>
      {children}
    </NextThemesProvider>
  )
}
