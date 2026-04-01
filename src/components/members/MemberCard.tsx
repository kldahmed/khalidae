export default function MemberCard({ member }: { member: any }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col items-center">
      <div className="w-20 h-20 rounded-full bg-white/10 mb-3 overflow-hidden border border-white/10">
        {member.avatar_url ? <img src={member.avatar_url} alt={member.full_name || member.username || 'member'} className="w-full h-full object-cover" /> : null}
      </div>
      <div className="font-bold text-lg mb-1">{member.full_name}</div>
      <div className="text-white/60 mb-1">@{member.username}</div>
      <div className="text-white/50 text-sm mb-2 line-clamp-2">{member.bio}</div>
      <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold">Member</span>
    </div>
  );
}
