import Header from "./header"
import Footer from "./footer"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6">{children}</main>
    </>
  )
}
