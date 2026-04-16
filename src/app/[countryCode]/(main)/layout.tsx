import { Metadata } from "next"
import { Suspense } from "react"

import { getBaseURL } from "@lib/util/env"
import DynamicBanners from "@modules/layout/components/dynamic-banners"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <Suspense>
        <DynamicBanners />
      </Suspense>
      {props.children}
      <Footer />
    </>
  )
}
