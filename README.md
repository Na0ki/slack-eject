# Slack-Eject

## 依存関係
* node: v7.3.0
* BotKit: v0.1.2
* Bluebird: 3.4.7

## インストール方法
```
$ git clone https://github.com/Na0ki/slack-eject.git
$ cd slack-eject
$ npm install
```

## 使い方
### サーバ
* 実行
YOUR_TOKENをSlackで取得したbotのトークンに置き換えて実行する.
```
$ token=YOUR_TOKEN node app.js
```

### クライアント(Slack)
自分で作ったbotに対し, 以下のコマンドが有効です.
* devices  
CD-ROMドライブのデバイスを検索するコマンド.  
`ls -l /dev/ | grep cdrom` を内部で実行している.

* eject DEVICE_NAME  
ejectコマンドを実行する. `DEVICE_NAME` は任意のデバイス名.  
なお, 開発者はうっかりCD-ROMドライブ以外を意図せずejectしてしまう場合があることから, app.js側で名前にcdromが含まれている場合のみ実行するようにしてある.


## License
[LICENSE](/LICENSE)