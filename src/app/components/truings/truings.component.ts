import {Component, OnInit} from "@angular/core";
import {Truing} from "./truing";
import {TruingService} from "../../services/truing.service";
import StringUtils from "../../utils/stringUtils";
import {QINIU_DOMAIN} from "../../constant/config";
import { ActivatedRoute, Params }   from '@angular/router';

@Component({
  selector: 'truing',
  templateUrl: 'truings.component.html',
  styleUrls: ['truings.component.css'],
  providers: [TruingService]
})
export class TruingComponent implements OnInit {

  //排序项
  sort = {
    item: '',
    order: 'asc',
    key: ''
  }

  fileList: any [] = []

  //是否正在加载数据
  isLoadingData = false

  //是否显示删除确认框
  isShowConfirm = false

  //图片列表
  photoList: any [] = []

  //当前要删除的图片信息
  removePhoto: Truing

  //是否查看大图
  isPreview: boolean = false

  //当前大图Index
  previewIndex: number

  busTruingStatus: number = 0

  tipInfo: any = {
    title: '',
    message: '',
    on: false
  }

  photoInfoId: number

  /**
   * 构造函数
   * @param checkService
   */
  constructor(private truingService: TruingService,
              private route: ActivatedRoute) {
  }

  /**
   * 初始化事件
   */
  ngOnInit(): void {
    this.route.params.forEach((params: Params) => {
      this.photoInfoId = +params['photoinfoid']
    });
    this.getPhotos(this.photoInfoId)
    this.getStatus(this.photoInfoId)
  }

  getStatus(photoInfoId){
    this.truingService.getTruingStatus(photoInfoId).then((response:any)=>{
      this.busTruingStatus = response&&response.busTruingStatus ? response.busTruingStatus : 0
    })
  }

  /**
   * 获取图片列表
   */
  getPhotos(photoInfoId): void {
    //设置正在加载数据状态
    this.isLoadingData = true

    //请求加载图片列表
    this.truingService.getTruings(photoInfoId, this.sort.key, this.sort.order).then((photos: any) => {
      this.isLoadingData = false

      if(photos && photos.length){

        this.photoList = photos
        this.photoList.map((item,index)=>{
          this.photoList[index].imgKey = QINIU_DOMAIN+'/'+ item.imgKey+ '-300'
        }, this)
      }
        //设置返回数据
    })
  }

  /**
   * 设置排序
   * @param key
   * @param sortItem
   */
  onSort(key, sortItem) {
    if (sortItem === this.sort.item) {
      this.sort.order = this.sort.order === 'asc' ? 'desc' : 'asc'
    } else {
      this.sort.order = 'asc'
    }
    this.sort.item = sortItem
    this.sort.key = key
    this.getPhotos(this.photoInfoId)
  }

  /**
   * 删除图片信息
   * @param photo
   */
  onDelete(photo) {

    //显示删除确认框
    this.isShowConfirm = true

    //设置当前要删除的图片信息
    this.removePhoto = photo
  }

  /**
   * 确认事件
   */
  onConfirm() {

    //从列表中移除要删除的图片
    this.truingService.remove(this.photoInfoId, this.removePhoto.imgName).then((response)=> {
      for (let i = 0; i < this.photoList.length; i++) {
        if (this.photoList[i].id === this.removePhoto.id) {
          this.photoList.splice(i, 1)
          break
        }
      }
      //关闭删除确认框
      this.isShowConfirm = false
    })
  }

  /**
   * 关闭确认框
   */
  onCancel() {
    this.isShowConfirm = false
  }

  /**
   * 查看当前大图
   * @param index
   */
  onPreview(index) {
    this.isPreview = true
    this.previewIndex = index
  }

  /**
   * 关闭当前大图
   */
  onClosePreview() {
    this.isPreview = false
  }

  /**
   * 选择图片回调
   * @param fileList
   */
  setFileListCb(fileList){
    this.fileList = fileList
  }

  /**
   * 上传图片回调
   * @param index
   */
  uploadFileCb(response){
    //移除上传成功图片
    this.fileList.pop()

    //原片列表插入刚上传的图片信息
    let index = -1
    let imgVersion = response.imgVersion
    let saveTime = response.saveTime
    let id = response.id
    //查看当前图片是否存在列表中
    for(let i = 0; i < this.photoList.length; i++){
      let photoItem = this.photoList[i]
      if(response.imgName === photoItem.imgName){
        index = i
        id = photoItem.id
        imgVersion = photoItem.imgVersion
        saveTime = photoItem.saveTime
        break
      }
    }

    if(index > -1){
      this.photoList.splice(index, 1)
    }

    this.photoList.unshift(
      new Truing(id, response.imgIndex, QINIU_DOMAIN+"/"+ response.imgKey+ '-300', response.imgName,
        response.imgSize, imgVersion, saveTime, true)
    )
  }

  /**
   * 保存信息
   * @param params
   * @returns {Promise<Truing>}
   */
  saveTruing(params){
    let requestParams = {
      imgKey: params.imgKey,
      imgName: params.imgName,
      imgSize: params.imgSize
    }
    this.truingService.save(this.photoInfoId, requestParams).then((response)=>{
      params.done(response)
    })
  }

  /**
   * 完成确认完成
   */
  onFinish(){
    this.truingService.finish(this.photoInfoId).then((response)=>{
      this.busTruingStatus = response.busTruingStatus
      this.tipInfo = {
        title: '确认上传成功',
        message: '精修片，确认上传成功...',
        on: true
      }
    })
  }

  /**
   * 重新确认
   */
  onRedo(){
    this.truingService.redo(this.photoInfoId).then((response)=>{
      this.busTruingStatus = response.busTruingStatus
      this.tipInfo = {
        title: '重新确认成功',
        message: '精修片，重新确认成功，请上传...',
        on: true
      }
    })
  }

  /**
   * 关闭提示信息
   */
  closeTip(){
    this.tipInfo = {
      title: '',
      message: '',
      on: false
    }
  }

  setPhotoListByID(id,  isLoadingPreview){
    for(let i=0; i< this.photoList.length; i++){
      if(this.photoList[i].id == id){
        this.photoList[i].isLoadingPreview = isLoadingPreview

        if(isLoadingPreview){
          if(this.photoList[i].imgKey!=''){
            this.photoList[i].tempKey = this.photoList[i].imgKey
            this.photoList[i].imgKey = ''
          }
        }else{
          this.photoList[i].imgKey = this.photoList[i].tempKey
        }

        break
      }
    }
  }

  onLoadImage(id,src,isLoadingPreview){
    if(!isLoadingPreview){
      this.setPhotoListByID(id, true)
      this.loadImage(id, src)
    }
  }

  loadImage(id, src){
    let xhr = new XMLHttpRequest()
    xhr.open('get', src, true)
    xhr.send()
    let _this = this

    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        let result = { error: ''}
        try{
          result = JSON.parse(xhr.response)
        }catch(e){

        }
        if(result.error){
          setTimeout(function () {
            _this.loadImage(id, src)
          },2000)
        }else{
          _this.setPhotoListByID(id,false)
        }
      }
    }

  }
}
