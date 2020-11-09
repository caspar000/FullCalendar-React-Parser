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
            const comp = new ICAL.Component(parsed);
            const eventComps = comp.getAllSubcomponents("vevent");

            var events = eventComps.map(item => {
                if (item.getFirstPropertyValue("class") === "PRIVATE"){ 
                    return null; //do not show on calendar if the class is private
                }
                else {
                    const title = item.getFirstPropertyValue("summary");
                    const groupId = item.getFirstPropertyValue("categories");
                    const location = item.getFirstPropertyValue("location");

                    const start = item.getFirstPropertyValue("dtstart").toString();
                    const end = item.getFirstPropertyValue("dtend").toString();

                    //if I don't replace 00:00:00 with 24:00:00 any event that starts or ends with 00:00:00 will
                    //either not show or get displayed incorrectly on the calendar
                    const startTime = start.split("T").pop() === '00:00:00' ? '24:00:00' : start.split("T").pop() ;
                    const endTime = end.split("T").pop() === '00:00:00' ? '24:00:00' : end.split("T").pop();

                    const rrule = item.getFirstPropertyValue("rrule");

                    let daysOfWeek;
                    let color = "";

                    let eventObject = {
                        "title": title,
                        "location": location,
                        "groupId": groupId,
                    };
                    if (rrule !== null){
                        eventObject.daysOfWeek = daysOfWeek;
                        eventObject.startTime = startTime;
                        eventObject.endTime = endTime;
                    } else {
                        eventObject.start = start;
                        eventObject.end = end;
                    }
                    console.log(eventObject);
                    return eventObject;
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
