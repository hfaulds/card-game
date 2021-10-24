import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"

// The approach used in this component shows how to built a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header() {
  const { data: session, status } = useSession()

  return (
    <header>
      <div className="mb-6">
        <div className="flex justify-between items-center border-b-2 border-gray-100 py-6 md:justify-start md:space-x-10">
          <div className="hidden md:flex space-x-10">
            <a href="/">
              Home
            </a>
          </div>
          <nav className="hidden md:flex space-x-10">
            <a href="/games" className="text-base font-medium text-gray-500 hover:text-gray-900">
              Games
            </a>
          </nav>
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
            {!session && (
              <>
              <a className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900">
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
