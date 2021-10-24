import Header from "./header"
import Footer from "./footer"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="w-8/12 mx-auto px-4 sm:px-6">
      <Header />
      <main className="">{children}</main>
    </div>
  )
}
