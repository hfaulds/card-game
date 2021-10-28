import Header from "./header"
import Footer from "./footer"

interface LayoutProps {
  fullscreen: boolean,
  children: React.ReactNode
}

export default function Layout({ fullscreen, breadcrumbs, children }: LayoutProps) {
  return (
    <div className={`w-8/12 mx-auto px-4 sm:px-6 ${!!fullscreen ? "h-screen" : ""}`}>
      <Header breadcrumbs={breadcrumbs}/>
      {children}
    </div>
  )
}
