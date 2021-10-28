import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"

export default function Header({breadcrumbs}) {
  const { data: session, status } = useSession()

  return (
    <header>
      <div className="mb-6">
        <div className="flex justify-between items-center border-b-2 border-gray-100 py-6 md:justify-start md:space-x-10">
          <div className="hidden md:flex space-x-10">
            <Link href="/">
              Home
            </Link>
          </div>
          <nav className="hidden md:flex space-x-10">
            <Link href="/campaigns" className="text-base font-medium text-gray-500 hover:text-gray-900">
              Campaigns
            </Link>
            {
              breadcrumbs && breadcrumbs.map((breadcrumb, i) => {
                if (!!breadcrumb.url) {
                  return <Link key={i} href={breadcrumb.url} className="text-base font-medium text-gray-500 hover:text-gray-900">
                    {breadcrumb.text}
                    </Link>
                } else {
                  return <span key={i} className="text-base font-medium text-gray-500">
                    {breadcrumb.text}
                  </span>
                }
              })
            }
          </nav>
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
            {!session && (
              <>
                <a className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"
                  href={`/api/auth/signin`}
                  onClick={(e) => {
                    e.preventDefault()
                    signIn()
                  }}
                >
                  Sign in
                </a>
              </>
            )}
            {session?.user && (
              <>
                <img src={session.user.image} className="w-11 h-11 rounded-full mr-2"/>
                <a
                  href={`/api/auth/signout`}
                  onClick={(e) => {
                    e.preventDefault()
                    signOut()
                  }}
                >
                  Sign out
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
