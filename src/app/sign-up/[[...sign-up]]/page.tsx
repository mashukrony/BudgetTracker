import { SignUp } from "@clerk/nextjs"
import loginBackground from "@/components/images/BackgroundLogin.png"

export default function SignUpPage() {
  return (
    <div
      className="relative flex min-h-svh w-full items-center justify-center bg-zinc-950 px-4 py-10"
      style={{
        backgroundImage: `url(${loginBackground.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/55" aria-hidden />
      <div className="relative z-10 w-full max-w-md">
        <SignUp forceRedirectUrl="/auth/post-sign-in" fallbackRedirectUrl="/auth/post-sign-in" />
      </div>
    </div>
  )
}
