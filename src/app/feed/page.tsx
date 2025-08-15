export default function FeedPage() {
  const posts = [
    {
      id: 1,
      title: "Neighbour Evening Announcement",
      content:
        "You are welcome to the neighbour evening next Saturday at 6 PM in the housing association's club room!",
      author: "Mary Example",
      createdAt: "2025-04-24",
    },
    {
      id: 2,
      title: "Lost & Found: Bicycle Key",
      content:
        "A bicycle key was found in the bike storage. You can pick it up from under the notice board in staircase A.",
      author: "Peter Example",
      createdAt: "2025-04-23",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-800">
        Neighbourhood Notice Board
      </h1>

      <div className="flex justify-center mb-8">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 hover:scale-105 transition-transform duration-300">
          + New Notice
        </button>
      </div>

      <div className="space-y-8 flex flex-col items-center">
        {posts.map((post) => (
          <div
            key={post.id}
            className="w-full sm:w-[32rem] lg:w-[36rem] bg-gradient-to-r from-white to-gray-50 shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 rounded-3xl border border-gray-200 hover:border-blue-400 transform hover:-translate-y-1 hover:scale-105"
          >
            <h2 className="text-2xl font-bold mb-2 text-gray-900">{post.title}</h2>
            <p className="text-gray-500 text-sm mb-3">
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              — {post.author}
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">{post.content}</p>

            <div className="flex justify-end">
              <button className="px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200">
                Comment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
