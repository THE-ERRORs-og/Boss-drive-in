import ChangePasswordForm from "./ChangePasswordForm";

export default async function Page({params}) {
  const { id:userid} = await params;
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <ChangePasswordForm userid={userid} />
    </div>
  );
}
