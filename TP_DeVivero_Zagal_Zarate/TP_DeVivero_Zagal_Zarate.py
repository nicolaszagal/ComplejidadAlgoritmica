from tkinter import *
from tkinter import messagebox
from tkinter import ttk
import networkx as nx
import csv

pantalla=Tk()
pantalla.title("Inicio")
pantalla.geometry("650x600+500+100")
origen=StringVar()
destino=StringVar()
clas=IntVar()
tip=IntVar()
precioKM=0.9
opciones=[]
G = nx.Graph()

class ScrollableFrame(Frame):
  def __init__(self, parent, *args, **kwargs):
    super().__init__(parent, *args, **kwargs)
    self.canvas = Canvas(self, borderwidth=0, background="#ffffff")
    self.frame = Frame(self.canvas)
    self.vsb = Scrollbar(self, orient="vertical", command=self.canvas.yview)
    self.canvas.configure(yscrollcommand=self.vsb.set)
    self.vsb.pack(side="right", fill="y")
    self.canvas.pack(side="left", fill="both", expand=True)
    self.canvas.create_window((4, 4), window=self.frame, anchor="nw", tags="self.frame")
    self.frame.bind("<Configure>", self.on_frame_configure)
  def on_frame_configure(self, event):
    self.canvas.configure(scrollregion=self.canvas.bbox("all"))

def buscar_coincidencias(esp):
  if esp==orig:
    entrada = orig.get()
    coincidencias = [item for item in opciones if entrada.lower() in item.lower()]
    orig["values"] = coincidencias
  else:
    entrada = des.get()
    coincidencias = [item for item in opciones if entrada.lower() in item.lower()]
    des["values"] = coincidencias

def historial():
  datos=[]
  with open("datos.csv", mode="r", newline="") as archivo_csv:
    lector_csv = csv.reader(archivo_csv)
    for fila in lector_csv:
      datos.append(fila)
  ventana = Tk()
  ventana.title("Historial")

  tabla = ttk.Treeview(ventana, columns=tuple(range(len(datos[0]))), show="headings")

  for i, encabezado in enumerate(datos[0]):
    tabla.heading(i, text=encabezado)
    tabla.column(i, anchor="center")

  for fila in datos[1:]:
    tabla.insert("", "end", values=fila)

  tabla.pack(expand=YES, fill=BOTH)
  ventana.mainloop()

with open('destinos.csv', mode='r') as archivo_csv:
  lector_csv = csv.reader(archivo_csv)
  for columna in lector_csv:
    dest=columna[0]
    opciones.append(dest)

def destinos():
  with open('destinos.csv', mode='r') as archivo_csv:
    lector_csv = csv.reader(archivo_csv)
    for columna in lector_csv:
      dest=columna[0]
      opciones.append(dest)
  with open('destinos.csv', mode='r') as archivo_csv:
    lector_csv = csv.reader(archivo_csv)
    ventana = Tk()
    ventana.geometry("340x500")
    ventana.title("Valores del CSV")
    frame = ScrollableFrame(ventana)
    frame.pack(fill="both", expand=True)
    etiqueta = Label(frame.frame, text='\n'.join([', '.join(fila) for fila in lector_csv]))
    etiqueta.pack()
    ventana.mainloop()

with open('database.csv', mode='r',encoding='utf-8-sig') as archivo_csv:
  data = csv.reader(archivo_csv)
  for columna in data:
    orig=columna[0]
    dest=columna[1]
    peso = float(columna[2])
    G.add_edge(orig,dest,weight=peso)

def encontrar_camino(grafo, nodo1, nodo2):
  try:
    camino_corto = nx.shortest_path(grafo, source=nodo1, target=nodo2, weight="weight", method="dijkstra")
    peso_de_aristas = [grafo[camino_corto[i]][camino_corto[i + 1]]["weight"] for i in range(len(camino_corto) - 1)]
    return {
      "existe_camino": True,
      "camino": camino_corto,
      "peso_de_aristas": peso_de_aristas
    }
  except nx.NetworkXNoPath:
    return {"existe_camino": False}

def clase():
  cl=0
  if clas.get()==1:cl=1
  if clas.get()==2:cl=1.4
  if clas.get()==3:cl=1.6
  return cl

def tipo():
  tp=0
  if tip.get()==1:tp=1
  if tip.get()==2:tp=2
  return tp

def almacenar(origen,destino,ruta, clase,tipo, precio):
  datos = [origen,destino,ruta, clase,tipo, precio]
  with open("datos.csv", mode="a", newline="") as file:
    escritor_csv = csv.writer(file)
    escritor_csv.writerow(datos)

def calcular():
  if origen.get() not in opciones :
    messagebox.showerror(title="Error", message=f"El origen {origen.get()} es inválido.")
  if destino.get() not in opciones:
    messagebox.showerror(title="Error", message=f"El destino {destino.get()} es inválido.")
  if origen.get()=="" or destino.get()=="":
    messagebox.showerror(title="Error", message="No has ingresado un valor")
  if origen.get()==destino.get():
    messagebox.showerror(title="Error", message="Valores son iguales")
  if clase()==0 or tipo()==0:
    messagebox.showerror(title="Error", message="Sin elegir")
  if origen.get()!=destino.get():
    resultado = encontrar_camino(G, str(origen.get()), str(destino.get()))
    if resultado["existe_camino"]:
      b=" ---> ".join(resultado["camino"])
      suma=0
      for i in range(len(resultado["peso_de_aristas"])):
        suma=suma+(int(resultado["peso_de_aristas"][i]))
      precio=(round(suma*clase()*tipo()*precioKM,ndigits=5))
      if clas.get()==1: clse="Turista"
      if clas.get()==2: clse="Ejecutivo"
      if clas.get()==3: clse="Lujo"
      if tip.get()==1: tpo="Ida"
      if tip.get()==2: tpo="Ida y Vuelta"
      def guardar():
        almacenar(origen.get(),destino.get(), b, clse, tpo, precio)
      result = Tk()
      result.geometry("600x250+450+350")
      result.title("Resultado:")
      e1=Label(result,text="Origen: ").grid(row=0,column=0, padx=4, pady=5)
      Og=Label(result, text=origen.get()).grid(row=0,column=1, padx=4, pady=5)
      e2=Label(result,text="Destino: ").grid(row=1,column=0, padx=4, pady=5)
      Ds=Label(result, text=destino.get()).grid(row=1,column=1, padx=4, pady=5)
      e3=Label(result,text="Ruta: ").grid(row=2,column=0, padx=4, pady=5)
      Nds=Label(result,text=b).grid(row=2,column=1, padx=4, pady=5)
      e4=Label(result,text="Clase: ").grid(row=3,column=0, padx=4, pady=5)
      Class=Label(result,text=clse).grid(row=3,column=1, padx=4, pady=5)
      e5=Label(result,text="Tipo de vuelo: ").grid(row=4,column=0, padx=4, pady=5)
      Type=Label(result,text=tpo).grid(row=4,column=1, padx=4, pady=5)
      e6=Label(result,text="Precio: ").grid(row=5,column=0, padx=4, pady=5)
      Price=Label(result,text="USD "+str(precio)).grid(row=5,column=1, padx=4, pady=5)
      btGuardar = Button(result, text="Guardar",command=guardar, width=10, height=1).grid(row=6, column=0, padx=4, pady=5)
      btCerrar = Button(result, text="Salir", width=10, height=1).grid(row=6, column=1, padx=4, pady=5)
      result.mainloop()
    else:
      messagebox.showerror(title='Error',message=f"No existen vuelos entre {str(origen.get())} y {str(destino.get())}.")

campos_frame = Frame(pantalla)
campos_frame.pack()

avion=PhotoImage(file="avion.png",width=350,height=150)
imagen1 =Label(campos_frame, image=avion, anchor="center")
imagen1.grid(row=0, column=1, columnspan=2,padx=20,pady=25)

bvnd=Label(campos_frame, text="Bienvenido/a: ", justify="center")
bvnd.grid(row=1, column=1, columnspan=2)

e1=Label(campos_frame, text="Introduzca el origen del vuelo: ")
e1.grid(row=2, column=0, padx=30, pady=20,columnspan=2)

orig=ttk.Combobox(campos_frame, textvariable=origen, width=30, values=opciones)
orig.grid(row=2, column=2, padx=30,pady=20)

e2=Label(campos_frame, text="Introduzca el destino del vuelo:")
e2.grid(row=3, column=0, padx=30,columnspan=2)

des=ttk.Combobox(campos_frame, textvariable=destino, width=30, values=opciones)
des.grid(row=3, column=2, pady=20)

e3=Label(campos_frame, text="Seleccione su clase:")
e3.grid(row=5, column=1, padx=30)

e3=Label(campos_frame, text="Seleccione tipo de vuelo:")
e3.grid(row=7, column=1, padx=30, rowspan=2)

orig.bind("<KeyRelease>", lambda event: buscar_coincidencias(orig))
des.bind("<KeyPress>", lambda event: buscar_coincidencias(des))

rbTurista=Radiobutton(campos_frame, text='Turista', variable=clas, value=1,command=clase).grid(row=4, column=2, pady=5) 
rbEjecutiva=Radiobutton(campos_frame, text='Ejecutiva', variable=clas,value=2,command=clase).grid(row=5, column=2, pady=5) 
rbLujo=Radiobutton(campos_frame, text='Lujo', variable=clas,value=3,command=clase).grid(row=6, column=2, pady=5)

rbIda=Radiobutton(campos_frame, text='Ida', variable=tip,value=1,command=tipo).grid(row=7, column=2, pady=5)
rbIdVuelta=Radiobutton(campos_frame, text='Ida y Vuelta', variable=tip,value=2,command=tipo).grid(row=8, column=2, pady=5)

btDes = Button(campos_frame, text="Ver destinos",command=destinos,width=12, height=1)
btDes.grid(row=9, column=1, padx=2, pady=5)
btCal = Button(campos_frame, text="Calcular precio",command=calcular,width=12, height=1)
btCal.grid(row=9, column=2, padx=2, pady=5)
btHis = Button(campos_frame, text="Historial",command=historial,width=12, height=1)
btHis.grid(row=10, column=1, padx=2, pady=5)
btSal = Button(campos_frame, text="Salir",command=exit,width=12, height=1)
btSal.grid(row=10, column=2, padx=2, pady=5)

pantalla.mainloop()