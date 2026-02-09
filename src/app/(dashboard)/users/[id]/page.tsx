type UserDetailsPageProps = {
  params: {
    id: string;
  };
};

export default function UserDetailsPage({ params }: UserDetailsPageProps) {
  return (
    <main>
      <h3>User Details</h3>
      <p>User ID: {params.id}</p>
    </main>
  );
}
