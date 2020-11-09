import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import ICAL from 'ical.js';


export default class App extends React.Component {
    state = {
        currentEvents: [
        ]
    }
    componentDidMount(){
    }

    showFile = async (e) => {
        e.preventDefault();
        const reader = new FileReader();

        reader.onload = async (e) => {
            const text = (e.target.result);

            const parsed = ICAL.parse(text.trim());
            var comp = new ICAL.Component(parsed);
            var eventComps = comp.getAllSubcomponents("vevent");
            // console.log(JSON.stringify(eventComps));

            var events = eventComps.map(item => {
                if (item.getFirstPropertyValue("class") === "PRIVATE"){ //do not show on calendar if the class is private
                    return null;
                } else if (item.getFirstPropertyValue("rrule") != null) { //recurring event
                    const title = item.getFirstPropertyValue("summary");
                    const groupId = item.getFirstPropertyValue("categories");
                    const location = item.getFirstPropertyValue("location");

                    const start = item.getFirstPropertyValue("dtstart");
                    const end = item.getFirstPropertyValue("dtend");

                    const startTime = start.toString().split("T").pop() === '00:00:00' ? '24:00:00' : start.toString().split("T").pop() ;
                    const endTime = end.toString().split("T").pop() === '00:00:00' ? '24:00:00' : end.toString().split("T").pop();

                    let daysOfWeek;
                    let color = "";


                    switch(item.getFirstPropertyValue("summary")){
                    case "S: Evening Ritual":
                    case "S: Morning Ritual":
                        color="#ffbd33";
                        break;
                    case "S: Exercise":
                        color="#a0f694";
                        break;
                    case "S: Meditation":
                        color="#e58755";
                        break;
                    case "S: Deep Work Darkroom":
                        daysOfWeek = ['4','6'];
                        break;
                    case "S: Deep Work Vanir":
                        color = "#cbcbcb";
                        daysOfWeek = ['5'];
                        break;
                    default:
                    }

                    const toReturn = {
                        "title": title,
                        "groupId": groupId,
                        "location": location,
                        "daysOfWeek": daysOfWeek,
                        "startTime": startTime,
                        "endTime": endTime,
                        "color": color,
                        "textColor": '#000',
                    };
                    console.log(item.getFirstPropertyValue("summary"), start, end, color);
                    return toReturn;
                } else {
                    let color = "";

                    switch(item.getFirstPropertyValue("categories")){
                    case "university":
                        color="#c70039";
                        break;
                    default:
                    }

                    const toReturn2 = {
                        "title": item.getFirstPropertyValue("summary"),
                        "location": item.getFirstPropertyValue("location"),
                        "groupId": item.getFirstPropertyValue("categories"),
                        "start": item.getFirstPropertyValue("dtstart").toString(),
                        "end": item.getFirstPropertyValue("dtend").toString(),
                        "color": color,
                    };
                    return toReturn2;
                }
            });

            this.setState({currentEvents: events});
        };
        reader.readAsText(e.target.files[0]);
    }


    render() {
        return (
            <div>
              <input type="file" onChange={(e) => this.showFile(e)}/>
              <FullCalendar
                plugins={[ dayGridPlugin, timeGridPlugin ]}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek'
                }}
                initialView="timeGridWeek"
                slotMinTime="06:00:00"
                slotMaxTime="26:00:00"
                events={this.state.currentEvents}
              />
            </div>

        );
    }

}
