(function (window) {
    // 调用new出来的player就会马上调用init（）
    function Player($audio) {
        return new Player.prototype.init($audio);
    }

    Player.prototype = {
        constructora: Player,

        // 音乐播放列表
        musicList: [],
        init: function ($audio) {
            // 获得jq封装的播放器.里面有jq的函数
            this.$audio = $audio;
            // 把jq的封装的播放器转换成js的播放器，才能使用播放器的函数
            this.audio = $audio.get(0);
        },

        // 歌曲索引号
        currentIndex: -1,

        // 播放音乐函数
        playMusic: function (index, music) {
            // 判断和现在播放的是不是同一首歌
            if (this.currentIndex === index) {

                

                if (this.audio.paused) {
                    this.audio.play()
                } else {

                    this.audio.pause();
                }
            } else {

                this.currentIndex = index;
                // jq封装的播放器里面的src改为music的src
                this.$audio.attr('src', music.link_url);
                // 下载歌曲
                

                // 转换成js的播放器才能播放
                this.audio.play();
            }
            $('.music_down').attr({
                "href": music.link_url,
                "download": "小铭音乐-"+music.name+".mp3"
            });
        },

        // 获取上一首的序号
        preIndex: function () {
            var index = this.currentIndex - 1;
            if (index < 0) {
                index = this.musicList.length - 1;
            }
            return index;
        },

        // 获取下一首的序号
        nextIndex: function () {
            var index = this.currentIndex + 1;
            if (index > this.musicList.length - 1) {
                index = 0;
            }
            return index;
        },

        // 删除音乐
        changeMusic: function (index) {
            // 删除对应数据
            this.musicList.splice(index, 1)
            if (index < this.currentIndex) {
                this.currentIndex--;
            }

        },

        // 更新进度条时间
        musicTimeUpdate: function (callBack) {
            var $this = this;
            this.$audio.on("timeupdate", function () {
                var duration = $this.audio.duration;
                var currentTime = $this.audio.currentTime;
                var timeStr = $this.formatDate(currentTime, duration);
                callBack(currentTime, duration, timeStr);
            });
        },
        formatDate: function (currentTime, duration) {
            var endMin = parseInt(duration / 60); // 2
            var endSec = parseInt(duration % 60);
            if (endMin < 10) {
                endMin = "0" + endMin;
            }
            if (endSec < 10) {
                endSec = "0" + endSec;
            }

            var startMin = parseInt(currentTime / 60); // 2
            var startSec = parseInt(currentTime % 60);
            if (startMin < 10) {
                startMin = "0" + startMin;
            }
            if (startSec < 10) {
                startSec = "0" + startSec;
            }
            return startMin + ":" + startSec + " / " + endMin + ":" + endSec;
        },
        musicSeekTo: function (value) {
            if (isNaN(value)) return;
            this.audio.currentTime = this.audio.duration * value;
        },

        // 声音
        musicVoiceSeekTo: function (value) {
            if (isNaN(value)) return;
            if (value < 0 || value > 1) return;
            // 0~1
            this.audio.volume = value;
        }
    }
    Player.prototype.init.prototype = Player.prototype;
    window.Player = Player;
})(window);


