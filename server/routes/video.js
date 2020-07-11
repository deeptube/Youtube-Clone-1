const express = require('express');
const router = express.Router();


const { auth } = require("../middleware/auth");
const multer = require("multer");
var ffmpeg = require("fluent-ffmpeg");
const {Video} = require('../models/Video');

// config option
let storage = multer.diskStorage({
    // 파일 저장 위치 설명
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`)
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if (ext !== '.mp4') {
            return cb(res.status(400).end('only jpg, png, mp4 is allowed'), false);
        }
        cb(null, true)
    }
});
// 파일하나 single로 
const upload = multer({ storage : storage}).single("file");

//=================================
//             Video
//=================================

// 클라이언트에서 request 보내면 서버의 index.js로 도착한다.
router.post('/uploadfiles', (req, res) => {

    // req 에서 받은 비디오를 서버에 저장
    // dependency multer다운로드
    upload(req, res, err => {
        if(err){
            return res.json({success:false, err});
        }
        return res.json({ success: true, url: res.req.file.path,fileName:res.req.file.filename})
    })
})

// 비디오 저장
router.post('/uploadVideo', (req, res) => {

    // 비디오 정보를 DB에 저장
    const video = new Video(req.body) // 클라이언트에서 보낸 variables변수가 req.body에 담김 (writer등)

    // mongodb 메소드로 저장
    video.save((err, doc)=>{
        if(err) return res.json({success: false, err})
        res.status(200).json({success: true})
    })
})

router.post('/thumbnail', (req, res) => {

    // 썸네일 생성하고 비디오 러닝타임 가져오기
    let filePath='';
    let fileDuration ='';

    // 비디오 정보 가져옴
    ffmpeg.ffprobe(req.body.url, function(err, metadata){
        console.dir(metadata);
        console.log(metadata.format.duration);

        fileDuration = metadata.format.duration;
    })
    // 썸네일 생성
    ffmpeg(req.body.url)
        .on('filenames', function (filenames) {
            console.log('Will generate ' + filenames.join(', '))
            console.log(filenames);

            filePath = "uploads/thumbnails/" + filenames[0];
        })
        .on('end', function () {
            console.log('Screenshots taken');
            return res.json({ success: true, url: filePath, fileDuration: fileDuration})
        })
        .on('error',function(err){
            console.error(err);
            return res.json({ success:false,err});

        })
        .screenshots({
            // Will take screens at 20%, 40%, 60% and 80% of the video
            count: 3,
            folder: 'uploads/thumbnails',
            size:'320x240',
            // %b input basename ( filename w/o extension )
            filename:'thumbnail-%b.png'
        });

})

module.exports = router;