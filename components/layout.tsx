import Header from "./header"
import Footer from "./footer"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <main className="container mx-auto">{children}</main>
      <Footer />
    </>
  )
}
