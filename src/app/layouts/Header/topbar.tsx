import WelcomeMessage from "@/components/welcomeMessege"
import NotificationToggle from "./NotificationToggle"

export default function Topbar() {
  return (
    <header className="flex justify-between items-center   ">
      <WelcomeMessage/>
      <NotificationToggle />
    </header>
  )
}
