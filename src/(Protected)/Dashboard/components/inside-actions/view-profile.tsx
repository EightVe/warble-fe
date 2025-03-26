"use client"

import { useState, useEffect } from "react"
import {
  AtSign,
  Ban,
  CalendarDays,
  CalendarIcon,
  CircleCheck,
  Edit,
  GlobeIcon,
  BadgeIcon as IdCard,
  Mail,
  Phone,
  Save,
  X,
  AlertTriangle,
  IdCardIcon,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import axiosInstance from "@/lib/axiosInstance"
import BanUser from "./ban-user"

export default function ViewProfile({
  name,
  email,
  status,
  scName,
  isBanned,
  avatar,
  region,
  joined,
  username,
  userAge,
  userBirthDate,
  gender,
  phoneNumber,
  bio,
  verifiedEmail,
  isAdmin,
  twoFactorEnabled,
  ip,
  org,
  postal,
  version,
  country_name,
  network,
  country_capital,
  city,
  _id,
  onRefresh,
}) {
  const [isEditMode, setIsEditMode] = useState(true)
  const [editField, setEditField] = useState(null)
  const [editValue, setEditValue] = useState("")
  const [editBoolValue, setEditBoolValue] = useState(false)
  const [editSelectValue, setEditSelectValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Store original values for discarding changes
  const [originalData, setOriginalData] = useState({})
  const [editedData, setEditedData] = useState({})

  useEffect(() => {
    // Initialize original data when component mounts
    setOriginalData({
      name,
      scName,
      username,
      email,
      phoneNumber,
      region,
      userAge,
      userBirthDate,
      gender,
      bio,
      ip,
      org,
      postal,
      version,
      country_name,
      country_capital,
      city,
      network,
      isAdmin,
      verifiedEmail,
      twoFactorEnabled,
    })

    // Initialize edited data with original values
    setEditedData({
      name,
      scName,
      username,
      email,
      phoneNumber,
      region,
      userAge,
      userBirthDate,
      gender,
      bio,
      ip,
      org,
      postal,
      version,
      country_name,
      country_capital,
      city,
      network,
      isAdmin,
      verifiedEmail,
      twoFactorEnabled,
    })
  }, [
    name,
    scName,
    username,
    email,
    phoneNumber,
    region,
    userAge,
    userBirthDate,
    gender,
    bio,
    ip,
    org,
    postal,
    version,
    country_name,
    country_capital,
    city,
    network,
    isAdmin,
    verifiedEmail,
    twoFactorEnabled,
  ])

  const statusStyles = {
    online: "bg-green-500/20 font-normal capitalize text-[11px] text-green-400 border-green-500/30",
    away: "bg-yellow-500/20 font-normal capitalize text-[11px] text-yellow-400 border-yellow-500/30",
    offline: "bg-slate-500/20 font-normal capitalize text-[11px] text-slate-400 border-slate-500/30",
  }

  // Format the joined date as "2 hours ago"
  const formattedJoinedDate = joined
  ? formatDistanceToNow(new Date(joined), { addSuffix: true })
  : "Unknown";

  const handleEditClick = (field, value, type = "text", options = null) => {
    if (field === "_id") return // _id is not editable

    setEditField({ name: field, type, options })
    if (type === "boolean") {
      setEditBoolValue(value)
    } else if (type === "select") {
      setEditSelectValue(value)
    } else if (field === "name") {
      setEditValue(name || "")
    } else if (field === "scName") {
      setEditValue(scName || "")
    } else {
      setEditValue(value || "")
    }
  }

  const handleSave = async () => {
    try {
      let newValue
      if (editField.type === "boolean") {
        newValue = editBoolValue
      } else if (editField.type === "select") {
        newValue = editSelectValue
      } else {
        newValue = editValue
      }

      // Update the edited data
      setEditedData((prev) => ({
        ...prev,
        [editField.name]: newValue,
      }))

      // Close the dialog
      setEditField(null)
    } catch (error) {
      console.error("Error updating field:", error)
      toast.error("Failed to update field. Please try again.")
    }
  }

  const saveAllChanges = async () => {
    setIsLoading(true);
    try {
      const payload = {
        firstName: editedData.name,
        lastName: editedData.scName,
        username: editedData.username,
        emailAddress: editedData.email,
        phoneNumber: editedData.phoneNumber,
        userAge: editedData.userAge,
        userBirthDate: editedData.userBirthDate,
        gender: editedData.gender,
        bio: editedData.bio,
        ip: editedData.ip,
        org: editedData.org,
        postal: editedData.postal,
        version: editedData.version,
        country_name: editedData.country_name,
        country_capital: editedData.country_capital,
        city: editedData.city,
        network: editedData.network,
        isAdmin: editedData.isAdmin,
        verifiedEmail: editedData.verifiedEmail,
        twoFactorEnabled: editedData.twoFactorEnabled,
      };
  
      const response = await axiosInstance.put(`/dash/edit-user/${_id}`, payload);
  
      if (response.status === 200) {
        toast.success("User profile updated successfully");
        setIsEditMode(false);
        if (onRefresh) onRefresh(); // **Trigger refresh**
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  const discardChanges = () => {
    setEditedData(originalData)
    setIsEditMode(false)
    toast.warning("All changes have been discarded")
  }
  const renderEditableField = (label, value, icon, fieldName) => {
    const displayValue = editMode ? editedData[fieldName] || value : value

    return (
      <div
        className={cn(
          "flex items-center gap-2 text-sm py-1",
          isEditMode && fieldName !== "_id" && "cursor-pointer hover:bg-slate-800/50 rounded px-1",
        )}
        onClick={isEditMode && fieldName !== "_id" ? () => handleEditClick(fieldName, displayValue) : undefined}
      >
        {icon}
        <span className="font-normal">
          {displayValue || <div className="text-[#ff5757]/90 text-xs">Not Provided</div>}
        </span>
        {isEditMode && fieldName !== "_id" && <Edit className="h-3 w-3 ml-auto text-[#ff5757]" />}
      </div>
    )
  }

  const renderNonEditableField = (label, value, icon, fieldName) => {
    return (
      <div className="flex items-center gap-2 text-sm py-1">
        {icon}
        <span className="font-normal">{value || <div className="text-[#ff5757]/90 text-xs">Not Provided</div>}</span>
      </div>
    )
  }

  const renderToggleField = (label, value, fieldName, enableEdit = true) => {
    const displayValue = editMode ? editedData[fieldName] : value
    let statusText, statusIcon

    if (fieldName === "isAdmin") {
      statusText = displayValue ? "Granted" : "Denied"
      statusIcon = displayValue ? (
        <CircleCheck className="text-green-400 h-4 w-4" />
      ) : (
        <Ban className="text-red-400 h-4 w-4" />
      )
    } else if (fieldName === "verifiedEmail") {
      statusText = displayValue ? "Verified" : "Unverified"
      statusIcon = displayValue ? (
        <CircleCheck className="text-green-400 h-4 w-4" />
      ) : (
        <Ban className="text-red-400 h-4 w-4" />
      )
    } else if (fieldName === "twoFactorEnabled") {
      statusText = displayValue ? "Active" : "Inactive"
      statusIcon = displayValue ? (
        <CircleCheck className="text-green-400 h-4 w-4" />
      ) : (
        <Ban className="text-red-400 h-4 w-4" />
      )
    } else if (fieldName === "isBanned") {
      statusText = displayValue ? "Banned" : "Not Banned"
      statusIcon = displayValue ? (
        <CircleCheck className="text-green-400 h-4 w-4" />
      ) : (
        <Ban className="text-red-400 h-4 w-4" />
      )
    }

    return (
      <Card
        className={cn(
          "flex flex-col items-center justify-center p-3 bg-slate-900/20 border-gray-700/50",
          isEditMode && enableEdit && "cursor-pointer hover:bg-slate-700",
        )}
        onClick={isEditMode && enableEdit ? () => handleEditClick(fieldName, displayValue, "boolean") : undefined}
      >
        <p className="text-sm  text-gray-400">{label}</p>
        <p className="text-sm font-normal text-white flex items-center gap-1">
          <div className="flex items-center gap-1">
            {statusIcon} {statusText}
          </div>
        </p>
        {isEditMode && enableEdit && <Edit className="h-3 w-3 mt-1 text-[#ff5757]" />}
      </Card>
    )
  }

  // For convenience in the JSX
  const editMode = isEditMode

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full flex items-center justify-end gap-2">
        {editMode ? (
          <>
            <Button
              size="sm"
              onClick={discardChanges}
              className="font-normal bg-gray-600 hover:bg-gray-700"
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-1" /> Discard
            </Button>
            <Button
              size="sm"
              onClick={saveAllChanges}
              className="font-normal bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" /> Save Changes
                </>
              )}
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" onClick={() => setIsEditMode(true)} className="font-normal bg-[#4d4d4d]">
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
          </>
        )}
      </div>

      <div className="flex flex-col items-center gap-3">
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-gray-800 text-[#ff5757]">{name?.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col items-center gap-1">
          <h3 className="text-xl font-normal text-white flex items-center gap-2">
            {editMode ? (
              <div className="flex items-center gap-2">
                <div
                  className="cursor-pointer hover:bg-slate-800/50 p-1 rounded flex items-center"
                  onClick={() => handleEditClick("name", editedData.name || name)}
                >
                  {editedData.name || name} <Edit className="h-3 w-3 ml-1 text-[#ff5757]" />
                </div>
                <div
                  className="cursor-pointer hover:bg-slate-800/50 p-1 rounded flex items-center"
                  onClick={() => handleEditClick("scName", editedData.scName || scName)}
                >
                  {editedData.scName || scName} <Edit className="h-3 w-3 ml-1 text-[#ff5757]" />
                </div>
              </div>
            ) : (
              <>
                {name} {scName}
              </>
            )}
            <Badge className={statusStyles[status] || statusStyles["offline"]}>{status}</Badge>
          </h3>
        </div>
      </div>

      <div
        className={cn(
          "font-normal text-sm w-full text-start py-1",
          editMode && "cursor-pointer hover:bg-slate-800/50 rounded px-1",
        )}
        onClick={editMode ? () => handleEditClick("bio", editedData.bio || bio, "textarea") : undefined}
      >
        <span>
          Bio :{" "}
          {editMode
            ? editedData.bio || <span className="text-[#ff5757]/90 text-xs">Not Provided</span>
            : bio || <span className="text-[#ff5757]/90 text-xs">Not Provided</span>}
        </span>
        {editMode && <Edit className="h-3 w-3 ml-1 inline text-[#ff5757]" />}
      </div>

      <div className="grid w-full gap-4">
        <Card className="bg-slate-900/20 border-slate-700/50">
          <CardContent className="p-3 z-10">
            <div className="grid gap-2">
              {renderNonEditableField("ID", _id, <IdCardIcon className="h-4 w-4 text-[#ff5757]" />, "_id")}
              {renderEditableField("Username", username, <AtSign className="h-4 w-4 text-[#ff5757]" />, "username")}
              {renderEditableField("Email", email, <Mail className="h-4 w-4 text-[#ff5757]" />, "email")}
              {renderEditableField("Phone", phoneNumber, <Phone className="h-4 w-4 text-[#ff5757]" />, "phoneNumber")}
              {renderNonEditableField(
                "Joined",
                formattedJoinedDate,
                <CalendarIcon className="h-4 w-4 text-[#ff5757]" />,
                "joined",
              )}
              {renderEditableField("Region", region, <GlobeIcon className="h-4 w-4 text-[#ff5757]" />, "region")}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/20 border-slate-700/50">
          <CardContent className="p-3 z-10">
            <div className="grid gap-2">
              {renderEditableField(
                "Age",
                `${userAge} Years Old`,
                <CalendarDays className="h-4 w-4 text-[#ff5757]" />,
                "userAge",
              )}
              {renderEditableField(
                "Birth Date",
                userBirthDate,
                <CalendarIcon className="h-4 w-4 text-[#ff5757]" />,
                "userBirthDate",
              )}
              <div
                className={cn(
                  "flex items-center gap-2 text-sm py-1",
                  editMode && "cursor-pointer hover:bg-slate-800/50 rounded px-1",
                )}
                onClick={
                  editMode
                    ? () => handleEditClick("gender", editedData.gender || gender, "select", ["male", "female"])
                    : undefined
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-gender-ambiguous text-[#ff5757]"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.5 1a.5.5 0 0 1 0-1h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V1.707l-3.45 3.45A4 4 0 0 1 8.5 10.97V13H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V14H6a.5.5 0 0 1 0-1h1.5v-2.03a4 4 0 1 1 3.471-6.648L14.293 1zm-.997 4.346a3 3 0 1 0-5.006 3.309 3 3 0 0 0 5.006-3.31z"
                  />
                </svg>
                <span className="font-normal capitalize">{editMode ? editedData.gender || gender : gender}</span>
                {editMode && <Edit className="h-3 w-3 ml-auto text-[#ff5757]" />}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/20 border-slate-700/50">
          <p className="p-4 text-sm text-[#ff5757]">Network Information</p>
          <CardContent className="p-3 z-10 pt-0">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 text-sm py-1">
                <span className="font-normal">IP Address : {editMode ? editedData.ip || "N/A" : ip || "N/A"}</span>
                {editMode && (
                  <Edit
                    className="h-3 w-3 ml-1 text-[#ff5757] cursor-pointer"
                    onClick={() => handleEditClick("ip", editedData.ip || ip)}
                  />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm py-1">
                <span className="font-normal">
                  Organization Provider : {editMode ? editedData.org || "N/A" : org || "N/A"}
                </span>
                {editMode && (
                  <Edit
                    className="h-3 w-3 ml-1 text-[#ff5757] cursor-pointer"
                    onClick={() => handleEditClick("org", editedData.org || org)}
                  />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm py-1">
                <span className="font-normal">
                  Postal ZIP : {editMode ? editedData.postal || "N/A" : postal || "N/A"}
                </span>
                {editMode && (
                  <Edit
                    className="h-3 w-3 ml-1 text-[#ff5757] cursor-pointer"
                    onClick={() => handleEditClick("postal", editedData.postal || postal)}
                  />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm py-1">
                <span className="font-normal">
                  Version : {editMode ? editedData.version || "N/A" : version || "N/A"}
                </span>
                {editMode && (
                  <Edit
                    className="h-3 w-3 ml-1 text-[#ff5757] cursor-pointer"
                    onClick={() => handleEditClick("version", editedData.version || version)}
                  />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm py-1">
                <span className="font-normal">
                  Country Name : {editMode ? editedData.country_name || "N/A" : country_name || "N/A"}
                </span>
                {editMode && (
                  <Edit
                    className="h-3 w-3 ml-1 text-[#ff5757] cursor-pointer"
                    onClick={() => handleEditClick("country_name", editedData.country_name || country_name)}
                  />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm py-1">
                <span className="font-normal">
                  Country Capital : {editMode ? editedData.country_capital || "N/A" : country_capital || "N/A"}
                </span>
                {editMode && (
                  <Edit
                    className="h-3 w-3 ml-1 text-[#ff5757] cursor-pointer"
                    onClick={() => handleEditClick("country_capital", editedData.country_capital || country_capital)}
                  />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm py-1">
                <span className="font-normal">City : {editMode ? editedData.city || "N/A" : city || "N/A"}</span>
                {editMode && (
                  <Edit
                    className="h-3 w-3 ml-1 text-[#ff5757] cursor-pointer"
                    onClick={() => handleEditClick("city", editedData.city || city)}
                  />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm py-1">
                <span className="font-normal">
                  Network : {editMode ? editedData.network || "N/A" : network || "N/A"}
                </span>
                {editMode && (
                  <Edit
                    className="h-3 w-3 ml-1 text-[#ff5757] cursor-pointer"
                    onClick={() => handleEditClick("network", editedData.network || network)}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-4 gap-2 ">
          {renderToggleField("Admin Access", isAdmin, "isAdmin")}
          {renderToggleField("Email Verification", verifiedEmail, "verifiedEmail")}
          {renderToggleField("2FA Status", twoFactorEnabled, "twoFactorEnabled")}
          {renderToggleField("Ban Status", isBanned, "isBanned", false)}
        </div>
      </div>

      {/* Edit Modal */}
      {editField && (
        <Dialog open={!!editField} onOpenChange={(open) => !open && setEditField(null)}>
          <DialogContent className="bg-[#171616] text-gray-200 border-none">
            <DialogHeader>
              <DialogTitle className="font-normal uppercase text-sm">Edit {editField.name}</DialogTitle>
            </DialogHeader>

            <div className="py-4">
              {editField.type === "textarea" ? (
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={`Enter ${editField.name}`}
                  className="bg-[#252525] border-none outline-none"
                />
              ) : editField.type === "boolean" ? (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="toggle-edit"
                    checked={editBoolValue}
                    onCheckedChange={setEditBoolValue}
                    className="bg-[#4d4d4d]"
                  />
                  <Label htmlFor="toggle-edit" className="font-normal">
                    {editField.name === "isAdmin"
                      ? editBoolValue
                        ? "Granted"
                        : "Denied"
                      : editField.name === "verifiedEmail"
                        ? editBoolValue
                          ? "Verified"
                          : "Unverified"
                        : editField.name === "twoFactorEnabled"
                          ? editBoolValue
                            ? "Active"
                            : "Inactive"
                          : editBoolValue
                            ? "Enabled"
                            : "Disabled"}
                  </Label>
                </div>
              ) : editField.type === "select" ? (
                <Select value={editSelectValue} onValueChange={setEditSelectValue}>
                  <SelectTrigger className="bg-[#252525] border-none outline-none">
                    <SelectValue placeholder={`Select ${editField.name}`} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252525] border-none outline-none">
                    {editField.options.map((option) => (
                      <SelectItem key={option} value={option} className="text-gray-200">
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={`Enter ${editField.name}`}
                  className="bg-[#252525] border-none outline-none"
                />
              )}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="bg-[#353535] border-none font-normal">
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleSave} className="bg-[#353535] border-none font-normal">
                <Save className="h-4 w-4 mr-1" /> Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

