import Image from "next/image"
import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import { ChevronRightIcon } from "@heroicons/react/outline"

export default function Header({ breadcrumbs }) {
  const { data: session, status } = useSession()

  return (
    <header>
      <div className="mb-6">
        <div className="flex justify-between items-center border-b-2 border-gray-100 py-6 justify-start space-x-10">
          <div className="flex space-x-10">
            <Link href="/">
              <a> Home </a>
            </Link>
          </div>
          <nav className="flex space-x-10">
            <Link href="/campaigns">
              <a className="text-base font-medium text-gray-500 hover:text-gray-900">
                Campaigns
              </a>
            </Link>
            <div className="sm:flex hidden">
              {breadcrumbs &&
                breadcrumbs.map((breadcrumb, i) =>
                  <>
                    {
                      (!!breadcrumb.url) ? (
                        <Link key={i} href={breadcrumb.url}>
                          <a className="truncate text-base font-medium text-gray-500 hover:text-gray-900">
                            {breadcrumb.text}
                          </a>
                        </Link>
                      ) : (
                        <span
                          key={i}
                          className="truncate text-base font-medium text-gray-500"
                        >
                          {breadcrumb.text}
                        </span>
                      )
                    }
                    { (i < breadcrumbs.length -1) && (
                      <span className="align-middle">
                        <ChevronRightIcon className="w-4 h-6 text-gray-500"/>
                      </span>
                    )}
                  </>
                )}
            </div>
          </nav>
          <div className="flex items-center justify-end flex-1">
            {!session && (
              <>
                <a
                  className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"
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
                {session.user.image && (
                  <div className="sm:flex hidden w-11 h-11 mr-2 relative">
                    <Image
                      className="rounded-full"
                      objectFit='contain'
                      layout='fill'
                      alt="player icon"
                      src={session.user.image}
                    />
                  </div>
                )}
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
