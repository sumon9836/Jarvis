/*------------------------------------------------------------------------------------------------------------------------------------------------------


Copyright (C) 2023 Loki - Xer.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Jarvis - Loki-Xer 


------------------------------------------------------------------------------------------------------------------------------------------------------*/

const { System, setData } = require("../lib");
const { parsedJid } = require("./client/");

System({
    pattern: "(jid|lid)",
    fromMe: true,
    type: "whatsapp",
    desc: "Give JID of chat/user",
}, async (message) => {
    let jid = message.quoted && message.reply_message.i ? message.reply_message.sender : message.jid;
    return await message.send(jid);
});

System({
    pattern: "(pp|fullpp|setpp)",
    fromMe: true,
    type: "whatsapp",
    desc: "Set full screen profile picture",
}, async (message, match) => {
    if (match === "remove") {
        await message.client.removeProfilePicture(message.user.jid);
        return await message.reply("_Profile Picture Removed_");
    }
    if (!message.reply_message || !message.reply_message.image) return await message.reply("_Reply to a photo_");
    let media = await message.reply_message.download();
    await message.client.updateProfile(media, message.user.jid);
    return await message.reply("_Profile Picture Updated!_");
});

System({
    pattern: "dlt",
    fromMe: true,
    type: "whatsapp",
    desc: "Deletes a message",
}, async (message) => {
    if (!message.quoted) return await message.reply("_Reply to a message to delete it!_");
    await message.reply(message.reply_message.data.key, {}, "delete");
});

System({
    pattern: "antiviewones",
    fromMe: true,
    type: "manage",
    desc: "To get info about promot and demote"
}, async (message, match) => {
    if (match === "on") { 
      const antiviewones = await setData(message.user.id, "active", "true", "antiviewones");
      return await message.send("_*activated*_");
    } else if (match === "off") {
      const antiviewones = await setData(message.user.id, "disactive", "false", "antiviewones");
      return await message.send("_*deactivated*_");
    } else {
      if (!message.isGroup) return message.send("_*antiviewones on/off*_");
      await message.send("\n*Choose a a settings to on/off antiviewones*\n",{ values: [{ displayText: "*on*", id: "antiviewones on" }, { displayText: "*off*", id: "antiviewones off" }], withPrefix: true, participates: [message.sender] }, "poll");
    };
});

System({
	pattern: 'clear ?(.*)',
	fromMe: true,
	desc: 'delete whatsapp chat',
	type: 'whatsapp'
}, async (message, match) => {
	await message.client.chatModify({ delete: true, lastMessages: [message.data] }, message.jid);
	await message.reply('_Cleared.._')
});

System({
	pattern: 'archive ?(.*)',
	fromMe: true,
	desc: 'archive whatsapp chat',
	type: 'whatsapp'
}, async (message, match) => {
	await message.client.chatModify({ archive: true, lastMessages: [message.data] }, message.jid);
	await message.reply('_Archived.._')
});

System({
	pattern: 'unarchive ?(.*)',
	fromMe: true,
	desc: 'unarchive whatsapp chat',
	type: 'whatsapp'
}, async (message, match) => {
	await message.client.chatModify({ archive: false, lastMessages: [message.data] }, message.jid);
	await message.reply('_Unarchived.._')
});

System({
	pattern: 'chatpin ?(.*)',
	fromMe: true,
	desc: 'pin a chat',
	type: 'whatsapp'
}, async (message, match) => {
	await message.client.chatModify({ pin: true }, message.jid);
	await message.reply('_Pined.._')
});

System({
	pattern: 'unpin ?(.*)',
	fromMe: true,
	desc: 'unpin a msg',
	type: 'whatsapp'
}, async (message, match) => {
	await message.client.chatModify({ pin: false }, message.jid);
	await message.reply('_Unpined.._')
});

System({
    pattern: "(block|blk)",
    fromMe: true,
    type: "whatsapp",
    desc: "Block a user",
}, async (message, match) => {
    if (match === "list") {
       const numbers = await message.client.fetchBlocklist();
       if (!numbers?.length) return message.reply("_*No block list found*_");
       const blockList = `_*Block List*_\n\n${numbers.map(n => `- +${n.replace('@s.whatsapp.net', '')}`).join('\n')}`;
       return await message.reply(blockList);
    }
    let jid = message.quoted ? message.reply_message.sender : !message.isGroup ? message.jid : false;
    if(!jid) return message.reply("*Reply to a user to block them or use 'block list' to view the block list.*");
    await message.client.updateBlockStatus(jid, "block");
    await message.reply("_*Blocked!*_");
});

System({
    pattern: "(unblock|unblk)",
    fromMe: true,
    type: "whatsapp",
    desc: "Unblock a user"
}, async (message, match) => {
    if (match === "all") {
        const numbers = await message.client.fetchBlocklist();
        if (!numbers?.length) return message.reply("_*No block list found*_");
        await Promise.all(numbers.map(async (jid) => {
            await message.client.updateBlockStatus(jid, "unblock");
            await new Promise((res) => setTimeout(res, 1500));
	}));
        const unblockList = `_*Unblock List*_\n\n${numbers.map(n => `- +${n.replace('@s.whatsapp.net', '')}`).join('\n')}`;
        return await message.reply(unblockList);
    }
    let jid = message.quoted ? message.reply_message.sender : !message.isGroup ? message.jid : false;
    if(!jid) return message.reply("*Reply to a user to unblock them or use 'unblock all' to unblock all the block list.*");
    await message.client.updateBlockStatus(jid, "unblock");
    await message.reply("_*Unblocked!*_");
});

System({
    pattern: "setbio",
    fromMe: true,
    desc: "To change your profile status",
    type: "whatsapp",
}, async (message, match) => {
    match = match || message.reply_message.text;
    if (!match) return await message.send('*Need Status!*\n*Example: setbio Hey there! I am using WhatsApp*.');
    await message.client.updateProfileStatus(match);
    await message.reply('_Profile bio updated_');
});

System({
    pattern: 'setname ?(.*)',
    fromMe: true,
    desc: 'To change your profile name',
    type: 'whatsapp'
}, async (message, match) => {
    match = match || message.reply_message.text;
    if (!match) return await message.send('*Need Name!*\n*Example: setname your name*.');
    await message.client.updateProfileName(match);
    await message.reply('_Profile name updated_');
});

System({
    pattern: "forward",
    fromMe: true,
    desc: "Forwards the replied message",
    type: "whatsapp",
}, async (message, match) => {
    if (!message.quoted) return await message.reply('Reply to message');
    if (!match) return await message.reply("*Provide a JID; use 'jid' command to get JID*");
    let jids = parsedJid(match);
    for (let jid of jids) {
        await message.client.forwardMessage(jid, message.reply_message.message);
    }
    await message.reply("_Message forwarded_");
});

System({
    pattern: 'caption ?(.*)',
    fromMe: true,
    type: 'whatsapp',
    desc: 'Change video or image caption'
}, async (message, match) => {
    if (!message.reply_message.video && !message.reply_message.image && !message.image && !message.video) return await message.reply('*_Reply to an image or video_*');
    if (!match) return await message.reply("*Need a query, e.g., .caption Hello*");
    await message.client.forwardMessage(message.jid, message.quoted ? message.reply_message.message : message.message, { caption: match });
});

System({
	pattern: 'getprivacy ?(.*)',
	fromMe: true,
	desc: 'get your privacy settings',
	type: 'privacy'
}, async (message, match) => {
	const { readreceipts, profile, status, online, last, groupadd, calladd } = await message.client.fetchPrivacySettings(true);
	const msg = `*♺ my privacy*\n\n*ᝄ name :* ${message.client.user.name}\n*ᝄ online:* ${online}\n*ᝄ profile :* ${profile}\n*ᝄ last seen :* ${last}\n*ᝄ read receipt :* ${readreceipts}\n*ᝄ about seted time :*\n*ᝄ group add settings :* ${groupadd}\n*ᝄ call add settings :* ${calladd}`;
	let img = await message.client.profilePictureUrl(message.user.jid, 'image').catch(() => "https://i.ibb.co/sFjZh7S/6883ac4d6a92.jpg");
	await message.send(img, { caption: msg }, 'image');
});

System({
	pattern: 'lastseen ?(.*)',
	fromMe: true,
	desc: 'to change lastseen privacy',
	type: 'privacy'
}, async (message, match) => {
	if (!match) return await message.send(`_*Example:-* ${message.prefix} all_\n_to change last seen privacy settings_`);
	const available_privacy = ['all', 'contacts', 'contact_blacklist', 'none'];
	if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateLastSeenPrivacy(match);
	await message.send(`_Privacy settings *last seen* Updated to *${match}*_`);
});


System({
	pattern: 'online ?(.*)',
	fromMe: true,
	desc: 'to change online privacy',
	type: 'privacy'
}, async (message, match) => {
	if (!match) return await message.send(`_*Example:-* ${message.prefix} online all_\n_to change *online*  privacy settings_`);
	const available_privacy = ['all', 'match_last_seen'];
	if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateOnlinePrivacy(match);
	await message.send(`_Privacy Updated to *${match}*_`);
});


System({
	pattern: 'mypp ?(.*)',
	fromMe: true,
	desc: 'privacy setting profile picture',
	type: 'privacy'
}, async (message, match) => {
	if (!match) return await message.send(`_*Example:-* ${message.prefix} mypp all_\n_to change *profile picture*  privacy settings_`);
	const available_privacy = ['all', 'contacts', 'contact_blacklist', 'none'];
	if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateProfilePicturePrivacy(match)
	await message.send(`_Privacy Updated to *${match}*_`);
});

System({
	pattern: 'mystatus ?(.*)',
	fromMe: true,
	desc: 'privacy for my status',
	type: 'privacy'
}, async (message, match) => {
	if (!match) return await message.send(`_*Example:-* mystatus all_\n_to change *status*  privacy settings_`);
	const available_privacy = ['all', 'contacts', 'contact_blacklist', 'none'];
	if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateStatusPrivacy(match)
	await message.send(`_Privacy Updated to *${match}*_`);
});

System({
	pattern: 'read ?(.*)',
	fromMe: true,
	desc: 'privacy for read message',
	type: 'privacy'
}, async (message, match) => {
	if (!match) return await message.send(`_*Example:-* ${message.prefix} read all_\n_to change *read and receipts message*  privacy settings_`);
	const available_privacy = ['all', 'none'];
	if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateReadReceiptsPrivacy(match);
	await message.send(`_Privacy Updated to *${match}*_`);
});


System({
	pattern: 'groupadd ?(.*)',
	fromMe: true,
	desc: 'privacy for group add',
	type: 'privacy'
}, async (message, match) => {
	if (!match) return await message.send(`_*Example:-* ${message.prefix} groupadd all_\n_to change *group add*  privacy settings_`);
	const available_privacy = ['all', 'contacts', 'contact_blacklist', 'none'];
	if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateGroupsAddPrivacy(match)
	await message.send(`_Privacy Updated to *${match}*_`);
});

System({
    pattern: 'msgpin ?(.*)',
    fromMe: true,
    type: 'whatsapp',
    desc: 'pin a message in chat'
}, async (message, match) => {
    if (!message.quoted || !match) return await message.reply(`_Reply to a message to pin it_\n\n*Example*: _msgpin 24 =for pin msg for 24 hour_\n _msgpin 7 = for pin msg for 7days_\n _msgpin 30 = for pin msg for 30 days_`);
    var array = { '24': 86400, '7': 604800, '30': 2592000 };
    var time = array[match];
    if (!time) return await message.reply(`_Reply to a message to pin it_\n\n*Example*: _msgpin 24 =for pin msg for 24 hour_\n _msgpin 7 = for pin msg for 7days_\n _msgpin 30 = for pin msg for 30 days_`);
    await message.reply(message.reply_message.data.key, { type: 1, time }, "pin");
});
