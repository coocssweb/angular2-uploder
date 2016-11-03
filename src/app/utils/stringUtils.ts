export default {
  stampToString(stamp) {
    let value = new Date(stamp)
    let year = value.getFullYear().toString()
    let month = (value.getMonth() + 1).toString()
    let date = value.getDate().toString()
    let hour = value.getHours().toString()
    let minute = value.getMinutes().toString()
    let second = value.getSeconds().toString()

    if(month.length == 1){
      month = '0' + month
    }

    if(date.length == 1){
      date = '0' + date
    }

    if(hour.length == 1){
      hour = '0' + hour
    }

    if(minute.length == 1){
      minute = '0' + minute
    }

    if(second.length == 1){
      second = '0' + second
    }

    return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second
  }
}
