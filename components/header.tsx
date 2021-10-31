import Image from "next/image"
import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import { ChevronRightIcon } from "@heroicons/react/outline"

export default function Header({ breadcrumbs }) {
  const { data: session, status } = useSession()

  return (
    <header>
      <div className="mb-6">
        <div className="flex items-center border-b-2 border-gray-100 py-6 space-x-5">
          <div className="flex space-x-10">
            <Link href="/">
              <a className="text-base font-medium text-gray-500 hover:text-gray-900">
                Home
              </a>
            </Link>
          </div>
          <nav className="flex flex-grow space-x-1 truncate">
            <Link href="/campaigns">
              <a className="text-base font-medium text-gray-500 hover:text-gray-900">
                Campaigns
              </a>
            </Link>
            {breadcrumbs?.map((breadcrumb, i) => (
              <>
                <ChevronRightIcon
                  key={`chevron-${i}`}
                  className="sm:inline hidden w-4 h-6 text-gray-500"
                />
                {!!breadcrumb.url ? (
                  <Link key={i} href={breadcrumb.url}>
                    <a className="sm:inline hidden truncate text-base font-medium text-gray-500 hover:text-gray-900">
                      {breadcrumb.text}
                    </a>
                  </Link>
                ) : (
                  <span
                    key={i}
                    className="sm:inline hidden truncate text-base font-medium"
                  >
                    {breadcrumb.text}
                  </span>
                )}
              </>
            ))}
          </nav>
          <div className="flex flex-none items-center">
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
                      objectFit="contain"
                      layout="fill"
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
