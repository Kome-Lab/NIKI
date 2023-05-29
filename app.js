//必要な物を召喚
const { Client, GatewayIntentBits, ActivityType} = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const fs = require("fs");

//jsonを読み込む
const config = require("./config.json");

//TOKEN確認
if (config.DISCORD_BOT_TOKEN == undefined) {
    console.error("TOKENが設定されていません。");
    process.exit(0);
}

//ログイン完了通知
client.on("ready", () => {
    const guild = client.guilds.cache.get(config.TARGET_GUILD_ID);

    console.log(`ログイン完了: ${client.user.tag}`);

    //ステータスメッセージ設定
    client.user.setActivity(config.DISCORD_BOT_STATUS_MESSAGE, { type: ActivityType.Playing});

    //ユーザー名・ニックネーム取得
    guild.members.fetch(config.TARGET_USER_ID).then(member => {

        console.log(`${member.user.tag}のニックネームを取得しました。`);
        console.log(`ニックネーム: ${member.nickname}`);

        console.log(`${member.nickname}(${member.user.tag})の情報を書き込んでいます...`);

        //JSONファイルの読み込み
        let jsonData = {};
        if (fs.existsSync('target-info.json')) {
            const jsonContent = fs.readFileSync('target-info.json');
            jsonData = JSON.parse(jsonContent);
        }

        //ユーザーIDとニックネームをjsonに書くための型を設定
        function addMember(userId, nickname) {
            if (!jsonData.hasOwnProperty("nickname")) {
                jsonData.nickname = {};
            }
            jsonData.nickname[userId] = nickname;
        }

        // メンバーのユーザーIDとニックネームを追加
        addMember(member.user.id, member.nickname);

        //時刻情報とUTCの値を追加
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
        const formattedDateTime = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}.${milliseconds} UTC+${now.getTimezoneOffset() / -60}`;
        jsonData.gettime = formattedDateTime;

        //JSONファイルに書き込み
        fs.writeFile('target-info.json', JSON.stringify(jsonData, null, 2), err => {
            if (err) {
                console.error('エラーが発生しました:', err);
                return;
            }
            console.log('[',formattedDateTime,']','書き込みが完了しました。');
        });
    });
});



client.on("guildMemberUpdate", (oldMember, newMember) => {

    let updatejsonData = {};

    if (fs.existsSync('target-info.json')) {
        const jsonContent = fs.readFileSync('target-info.json');
        updatejsonData = JSON.parse(jsonContent);
    }

    //時刻情報とUTCの値を追加
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    const updatejsonformattedDateTime = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}.${milliseconds} UTC+${now.getTimezoneOffset() / -60}`;
    updatejsonData.gettime = updatejsonformattedDateTime;

    if (oldMember.user.id == config.TARGET_USER_ID || newMember.user.id == config.TARGET_USER_ID) {
        
        //ユーザーIDとニックネームをjsonに書くための型を設定
        function updateMember(userId, nickname) {
            if (!updatejsonData.hasOwnProperty("nickname")) {
                    updatejsonData.nickname = {};
            }
            updatejsonData.nickname[userId] = nickname;
        }

        if(config.options['force-set-nickname'] == false) {
            if (oldMember.nickname == null) {
                //ニックネーム変更通知
                console.log(`${oldMember.user.tag}がニックネームを変更しました。`);
                console.log(`変更前："ニックネーム無し"  ->  変更後："${newMember.nickname}"`);
                
                //jsonに記録されたユーザーIDとニックネームを更新
                updateMember(`${newMember.user.id}`, `${newMember.nickname}`);

                if(config.options['notification-nickname-change'] == true){
                    client.channels.cache.get(config.NOTIFICATION_CHANNEL_ID).send(`${oldMember.user.tag}がニックネームを変更しました。\n変更前："ニックネーム無し"  ->  変更後："${newMember.nickname}`);
                }
            }   
            else if (newMember.nickname == null) {
                //ニックネーム変更通知
                console.log(`${oldMember.user.tag}がニックネームを変更しました。`);
                console.log(`変更前："${oldMember.nickname}"  ->  変更後："ニックネーム無し"`);

                //jsonに記録されたユーザーIDとニックネームを更新
                updateMember(`${newMember.user.id}`, `null`);

                if(config.options['notification-nickname-change'] == true){
                    client.channels.cache.get(config.NOTIFICATION_CHANNEL_ID).send(`${oldMember.user.tag}がニックネームを変更しました。\n変更前："${oldMember.nickname}"  ->  変更後："ニックネーム無し"`);
                }
            }
            else if (oldMember.nickname !== newMember.nickname) {
                //ニックネーム変更通知
                console.log(`${oldMember.user.tag}がニックネームを変更しました。`);
                console.log(`変更前："${oldMember.nickname}"  ->  変更後："${newMember.nickname}"`);

                //jsonに記録されたユーザーIDとニックネームを更新
                updateMember(`${newMember.user.id}`, `${newMember.nickname}`);
            
                if(config.options['notification-nickname-change'] == true){
                    client.channels.cache.get(config.NOTIFICATION_CHANNEL_ID).send(`${oldMember.user.tag}がニックネームを変更しました。\n変更前："${oldMember.nickname}"  ->  変更後："${newMember.nickname}"`);
                }
            }
            //JSONファイルに書き込み
            fs.writeFile('target-info.json', JSON.stringify(updatejsonData, null, 2), err => {
                if (err) {
                    console.error('エラーが発生しました:', err);
                    return;
                }
                console.log('[',updatejsonformattedDateTime,']','更新が完了しました。');
            });
        }
        
        if(config.options['force-set-nickname'] == true && newMember.nickname !== config.FORCE_NICKNAME) {

            //ニックネーム強制変更
            newMember.setNickname(config.FORCE_NICKNAME);

            console.log(`${oldMember.nickname}(${oldMember.user.tag}) が ${newMember.nickname} にニックネームを変更しましたが、`);
            console.log(`強制ニックネーム固定機能が有効のため`);
            console.log(`${newMember.nickname}のニックネームを${config.FORCE_NICKNAME}に変更しました。`);
                
            if(config.options['notification-nickname-change'] == true){ 
                client.channels.cache.get(config.NOTIFICATION_CHANNEL_ID).send(`# ${oldMember.nickname}(${oldMember.user.tag}) が ${newMember.nickname} に変更されましたが、\n# 強制ニックネーム固定機能が有効のため\n# ${newMember.nickname}(${oldMember.user.tag})のニックネームを${config.FORCE_NICKNAME}に変更しました。`); 
            }
            
            //jsonに記録されたユーザーIDとニックネームを更新
            updateMember(`${newMember.user.id}`, `${config.FORCE_NICKNAME}`);
            
            //JSONファイルに書き込み
            fs.writeFile('target-info.json', JSON.stringify(updatejsonData, null, 2), err => {
                if (err) {
                    console.error('エラーが発生しました:', err);
                    return;
                }
                console.log('[',updatejsonformattedDateTime,']','更新が完了しました。');
            });
        }
    }
});

//ログイン
client.login(config.DISCORD_BOT_TOKEN );